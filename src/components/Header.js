import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountContext from '../Context/AccountContext';
import axios from 'axios';
import '../components/HeaderMain.css';
import './Header.css'

function Header() {
  const context = useContext(AccountContext);
  const { logout, getsession, updateUserAttributes, changePassword, deleteAccount } = context;
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    age: '',
    country: '',
    subscription: '',
    currentPassword: '',
    newPassword: '',
  });
  const [isSellerUser, setIsSellerUser] = useState(false); // New state to track if user is in SellerUsers group
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('first_name');
    if (storedRole) {
      setRole(storedRole);
    }
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
      getsession()
        .then(async session => {
          const details = {
            email: session.email || '',
            phone: session.phone_number || '',
            age: session["custom:age"] || '',
            country: session["custom:country"] || '',
            subscription: session["custom:subscription"] || '',
          };
          setUserDetails(details);
          setFormData({ ...details, currentPassword: '', newPassword: '' });

          // Check if user is in SellerUsers group
          try {
            const response = await axios.get(`https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getassignrolessellers?email=${session.email}`);
            console.log('SellerUsers API response:', response.data); // Debugging line
            setIsSellerUser(response.data.emailExists); // Adjusted based on response structure
          } catch (error) {
            console.error('Error checking SellerUsers group:', error);
          }
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      setIsLoggedIn(false);
    }
  }, [getsession]);

  const logOut = () => {
    logout()
      .then(() => {
        console.log('Logged out Successfully');
        localStorage.clear();
        setIsLoggedIn(false);
        navigate('/login');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Create an object for the attributes you want to update
    const attributesToUpdate = {
      "custom:age": formData.age,
      "custom:country": formData.country,
      "custom:subscription": formData.subscription
    };
  
    try {
      // Only update the specified attributes
      await updateUserAttributes(attributesToUpdate);
      
      // Update password if provided
      if (formData.newPassword) {
        await changePassword(formData.currentPassword, formData.newPassword);
      }
      
      // Update local state with new values
      setUserDetails({
        ...userDetails,
        age: formData.age,
        country: formData.country,
        subscription: formData.subscription
      });
      
      setShowPopup(false);
    } catch (error) {
      console.error('Error updating user attributes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await getsession(); // Ensure session is fetched
      await deleteAccount(); // Call deleteAccount from context
      localStorage.clear(); // Clear local storage
      setIsLoggedIn(false); // Update state
      setRole(null); // Reset role
      setUsername(""); // Reset username
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-dark navbar-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
          <i className="fas fa-music fa-2x"></i> {/* Font Awesome music icon */}
            
          </Link>
          <Link id="brand_name" className="navbar-brand" to="/">Music Streamer</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link id="hover" className="nav-link active" aria-current="page" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link id="hover" className="nav-link active" aria-current="page" to="/login">Login</Link>
              </li>
              {isLoggedIn && role !== 'admin' && (
                <li className="nav-item">
                  <Link id="hover" className="nav-link active" aria-current="page" to="/favorites">Favourite Albums</Link>
                </li>
              )}
               {isLoggedIn && role !== 'admin' && (
                <li className="nav-item">
                  <Link id="hover" className="nav-link active" aria-current="page" to="/favoritestracks">Favourite Tracks</Link>
                </li>
              )}
              {isLoggedIn && role === 'admin' && (
                <li className="nav-item">
                  <Link id="hover" className="nav-link active" aria-current="page" to="/admin">Dashboard</Link>
                </li>
              )}
              {isLoggedIn && role === 'admin' && (
                <li className="nav-item">
                  <Link id="hover" className="nav-link active" aria-current="page" to="/inventory">Inventory</Link>
                </li>
              )}
              {isLoggedIn && isSellerUser && (
                <li className="nav-item">
                  <Link id="hover" className="nav-link active" aria-current="page" to="/premium">Add Yours</Link>
                </li>
              )}
            </ul>
            <div className="dropdown btn-group">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                Select
              </button>
              <ul className="dropdown-menu dropdown-menu-dark">
                {isLoggedIn && (
                  <>
                    <li><button className="dropdown-item" type="button" onClick={() => setShowPopup(true)}>User Info</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" type="button">Change Password</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" type="button" onClick={logOut}>Logout</button></li>
                    <li><hr className="dropdown-divider" /></li>
                  </>
                )}
              </ul>
            </div>
            {isLoggedIn && (
              <span className="navbar-text">
                Logged in as, <span className="name-color">{username}</span>
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Popup Form */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h4>User Info</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="text"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Subscription</label>
                <input
                  type="text"
                  name="subscription"
                  value={formData.subscription || ''}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword || ''}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword || ''}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button className="btn btn-danger" type="button" onClick={handleDeleteAccount}>
                  Delete Account
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPopup(false)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
