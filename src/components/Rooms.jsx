import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, doc, deleteDoc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import "./Rooms.css";
import "@fontsource/kanit";

const InputData = () => {
  const [form, setForm] = useState({});
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false); // สำหรับแสดง Modal แจ้งเตือน


  const roitaiRef = collection(db, "rooms");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onSnapshot(roitaiRef, (snapshot) => {
      const newData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(newData);
      setFilteredData(newData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const search = e.target.value.toLowerCase();
    const filtered = data.filter((item) => {
      const matchesSearch =
        item.roomNumber?.toString().toLowerCase().includes(search) ||
        item.fullName?.toLowerCase().includes(search) ||
        item.idCardNumber?.includes(search) ||
        item.phoneNumber?.includes(search);

      return matchesSearch;
    });
    setFilteredData(filtered);
  };

  const handleAddData = async () => {
    try {
      // ตรวจสอบว่าหมายเลขห้องซ้ำหรือไม่
      const existingRoom = data.find(
        (item) => item.roomNumber === form.roomNumber
      );
      if (existingRoom) {
        setShowDuplicateModal(true); // แสดง Modal แจ้งเตือน
        return;
      }
  
      // ถ้าหมายเลขห้องไม่ซ้ำ ให้เพิ่มข้อมูลลง Firestore
      await addDoc(roitaiRef, form);
      setForm({});
      setShowModal(false);
    } catch (err) {
      console.error("Error adding room:", err);
    }
  };
  
  

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteDoc(doc(roitaiRef, deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(roitaiRef, editId), form);
      setShowModal(false);
      setEditId(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setForm({});
    setEditId(null);
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", "admin");
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.password === oldPassword) {
          await updateDoc(userDocRef, { password: newPassword });
          setSuccessMessage("Password updated successfully!");
          setErrorMessage("");
        } else {
          setErrorMessage("Old password is incorrect.");
          setSuccessMessage("");
        }
      } else {
        setErrorMessage("User does not exist.");
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-center">Wiyada Management</h2>
          <div className="d-flex align-items-center">
            <Button variant="secondary" className="me-2 custom-settings-btn" onClick={handleOpenSettings}>🔑</Button>
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
          </div>
      </div>
      <div className="mb-3 d-flex align-items-center">
        <Form.Control
          type="text"
          placeholder="Search . . ."
          value={searchTerm}
          onChange={handleSearch}
          style={{ maxWidth: "150px" }}
        />
        <Button variant="primary" onClick={() => setShowModal(true)} className="ms-2">
          Add Room
        </Button>
        <Form.Control
          as="select"
          className="ms-auto"
          style={{ maxWidth: "150px" }}
          onChange={(e) => {
            const selectedStatus = e.target.value;
            if (selectedStatus === "") {
              setFilteredData(data);
            } else {
              const filtered = data.filter((item) => item.status === selectedStatus);
              setFilteredData(filtered);
            }
          }}
        >
          <option value="">แสดงห้องทั้งหมด</option>
          <option value="มีผู้เช่า">มีผู้เช่า</option>
          <option value="ห้องว่าง">ห้องว่าง</option>
          <option value="ห้องมีปัญหา">ห้องมีปัญหา</option>
        </Form.Control>
      </div>

      <table className="table table-hover table-bordered mt-4">
        <thead className="table-dark">
          <tr>
            <th>หมายเลขห้อง</th>
            <th>วันที่เข้าพัก</th>
            <th>วันที่ย้ายออก</th>
            <th>ชื่อ-สกุล</th>
            <th>เลขบัตรประชาชน</th>
            <th>เบอร์โทร</th>
            <th>สถานะ</th>
            <th>หมายเหตุ</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData
            .slice()
            .sort((a, b) => {
              const [aPrefix, aNumber] = a.roomNumber.match(/^[^\d]+|\d+/g) || [];
              const [bPrefix, bNumber] = b.roomNumber.match(/^[^\d]+|\d+/g) || [];

              if (aPrefix < bPrefix) return -1;
              if (aPrefix > bPrefix) return 1;

              return parseInt(aNumber, 10) - parseInt(bNumber, 10);
            })
            .map((item) => (
              <tr key={item.id}>
                <td>{item.roomNumber}</td>
                <td>{item.checkInDate}</td>
                <td>{item.checkOutDate}</td>
                <td>{item.fullName}</td>
                <td>{item.idCardNumber}</td>
                <td>{item.phoneNumber}</td>
                <td>{item.status}</td>
                <td>{item.note}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="ms-2"
                    onClick={() => openDeleteModal(item.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={handleCancel}>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Room" : "Add Room"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>หมายเลขห้อง : </Form.Label>
              <Form.Control
                type="text"
                name="roomNumber"
                value={form.roomNumber || ""}
                onChange={handleChange}
                readOnly={!!editId} 
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>วันที่เข้าพัก : </Form.Label>
              <Form.Control
                type="date"
                name="checkInDate"
                value={form.checkInDate || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>วันที่ย้ายออก : </Form.Label>
              <Form.Control
                type="date"
                name="checkOutDate"
                value={form.checkOutDate || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>ชื่อ-สกุล : </Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={form.fullName || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>เลขบัตรประชาชน : </Form.Label>
              <Form.Control
                type="text"
                name="idCardNumber"
                value={form.idCardNumber || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>เบอร์โทร : </Form.Label>
              <Form.Control
                type="text"
                name="phoneNumber"
                value={form.phoneNumber || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>สถานะ : </Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={form.status || ""}
                onChange={handleChange}
              >
                <option value="">เลือกสถานะ</option>
                <option value="มีผู้เช่า">มีผู้เช่า</option>
                <option value="ห้องว่าง">ห้องว่าง</option>
                <option value="ห้องมีปัญหา">ห้องมีปัญหา</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>หมายเหตุ : </Form.Label>
              <Form.Control
                as="textarea"
                name="note"
                value={form.note || ""}
                onChange={handleChange}
                rows={3}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={editId ? handleSave : handleAddData}>
            {editId ? "Save Changes" : "Add Room"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this room?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showLogoutModal} onHide={cancelLogout}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelLogout}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showSettingsModal} onHide={handleCloseSettings} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          <Form>
            <Form.Group>
              <Form.Label>Old Password</Form.Label>
              <Form.Control
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter old password"
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSettings}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangePassword}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDuplicateModal} onHide={() => setShowDuplicateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>หมายเลขห้องซ้ำ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>หมายเลขห้องนี้มีอยู่แล้ว กรุณาใส่หมายเลขห้องใหม่</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDuplicateModal(false)}>
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InputData;
