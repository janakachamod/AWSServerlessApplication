import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountContext from "../Context/AccountContext";
import './Login.css'

function Login() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [subscription, setSubscription] = useState("Personal");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registered, setRegistered] = useState(false);
  const [pIcon, setPIcon] = useState(false);
  const [cIcon, setCIcon] = useState(false);
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);// Error state for form validation

  const { signup, authenticate, getsession } = useContext(AccountContext);
  const navigate = useNavigate();

  useEffect(() => {
    getsession()
      .then((session) => {
        console.log(session);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [getsession]);

  // Toggle between login and registration forms
  const toggleForm = () => {
    setRegistered(!registered);
    setError(""); // Clear error message when toggling
  };

  // Show/Hide password functionality
  const togglePasswordVisibility = () => {
    setPIcon(!pIcon);
  };

  const toggleCPasswordVisibility = () => {
    setCIcon(!cIcon);
  };

  // Handle form submission for registration
  const handleRegistration = async (event) => {
    event.preventDefault();
  
    if (password !== cpassword) {
      setError("Passwords do not match");
      return;
    }
  
    if (!email || !firstName || !lastName || !password || !age || !country || !phoneNumber) {
      setError("All fields are required");
      return;
    }
  
    // Ensure age is a valid string representation of a number
    const formattedAge = String(parseFloat(age)); // Convert to string
    if (isNaN(formattedAge)) {
      setError("Age must be a valid number");
      return;
    }
  
    setLoading(true);
    try {
      await signup(email, firstName, lastName, password, country, formattedAge, phoneNumber, subscription);
      console.log("Registered Successfully");
      setError(""); // Clear any previous errors
      navigate("/login");
    } catch (err) {
      setError("Failed to register: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  
  // Handle form submission for login
  // In your component where you handle redirection
const handleLogin = async (event) => {
  event.preventDefault();
  try {
    await authenticate(email, password);
    const role = localStorage.getItem("role");
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  } catch (err) {
    setError("Login failed: " + err.message);
  }
};


  return (
    <div className="login-container col-md-4 text-center my-3 margin">
      <h3>{registered ? "Signup Here" : "Login Here"}</h3>
      <form className="my-3" id="login-form" onSubmit={registered ? handleRegistration : handleLogin}>
        {registered && (
          <>
            <div className="input-group col-md-4 my-4">
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                type="text"
                className="form-control"
                placeholder="First Name"
                aria-label="First Name"
                required
              />
            </div>
            <div className="input-group col-md-4 my-4">
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                type="text"
                className="form-control"
                placeholder="Last Name"
                aria-label="Last Name"
                required
              />
            </div>
            <div className="input-group col-md-4 my-4">
              <input
                value={age}
                onChange={(event) => setAge(event.target.value)}
                type="number"
                className="form-control"
                placeholder="Age"
                aria-label="Age"
                required
              />
            </div>
            <div className="input-group col-md-4 my-4">
              <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                type="tel"
                className="form-control"
                placeholder="Phone Number"
                aria-label="Phone Number"
                required
              />
            </div>
            <div className="input-group col-md-4 my-4">
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="form-control"
                aria-label="Country"
                required
              >
                <option value="">Select Country</option>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="UK">UK</option>
                <option value="Australia">Australia</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group col-md-4 my-4">
              <select
                value={subscription}
                onChange={(event) => setSubscription(event.target.value)}
                className="form-control"
                aria-label="Subscription"
              >
                <option value="Personal">Personal</option>
                <option value="Family">Family</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </>
        )}

        <div className="input-group col-md-4 my-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="form-control"
            placeholder="Email"
            aria-label="Email"
            required
          />
        </div>

        <div className="input-group col-md-4 my-4">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            id="passwordField"
            type={pIcon ? "text" : "password"}
            className="form-control"
            placeholder="Password"
            aria-label="Password"
            required
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={togglePasswordVisibility}
          >
            {pIcon ? "Hide" : "Show"}
          </button>
        </div>

        {registered && (
          <div className="input-group col-md-4 my-4">
            <input
              value={cpassword}
              onChange={(event) => setCPassword(event.target.value)}
              id="cpassword"
              type={cIcon ? "text" : "password"}
              className="form-control"
              placeholder="Confirm Password"
              aria-label="Confirm Password"
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={toggleCPasswordVisibility}
            >
              {cIcon ? "Hide" : "Show"}
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          className="btn btn-outline-info col-md-4 my-3"
        >
          {registered ? "Signup" : "Login"}
        </button>
      </form>

      <p>
        {!registered ? "Don't Have an Account?" : "Already have an account?"}
        <span
          className="text-info mx-2 login-signup"
          onClick={toggleForm}
        >
          {!registered ? "Signup Here" : "Login Here"}
        </span>
      </p>
    </div>
  );
}

export default Login;
