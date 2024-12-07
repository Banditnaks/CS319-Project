import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import { Modal, Button } from "react-bootstrap";

const Login = () => {
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState({ show: false, title: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setModal({
        show: true,
        title: "Login Failed",
        message: "Password cannot be empty.",
      });
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(collection(db, "users"), "admin");
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.password === password) {
          localStorage.setItem("isLoggedIn", "true");
          setModal({
            show: true,
            title: "Login Successful",
            message: "You have successfully logged in!",
          });
        } else {
          setModal({
            show: true,
            title: "Login Failed",
            message: "Invalid password. Please try again.",
          });
        }
      } else {
        setModal({
          show: true,
          title: "Error",
          message: "User does not exist.",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setModal({
        show: true,
        title: "Error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModal({ show: false, title: "", message: "" });
    setPassword("");
    if (modal.title === "Login Successful") {
      navigate("/rooms");
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center login-container">
      <div className="card login-card">
        <div className="card-body">
          <img src="/image/logo.png" alt="Wiyada Management Logo" className="logo-img" />
          <h2 className="text-center mb-4">Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal show={modal.show} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{modal.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleModalClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;
