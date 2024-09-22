// src/components/UserDetails.jsx

import React, { useEffect, useState } from 'react';
import './UserDetails.css';

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://ns59azyddc.execute-api.eu-north-1.amazonaws.com/prod/getusers', {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Convert response to JSON
        setUsers(data); // Directly use the data (no need to parse again)
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-details-container">
      <h1>User Details</h1>
      {users.length > 0 ? (
        <table className="user-details-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Country</th>
              <th>Age</th>
              <th>Subscription</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.userName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.country}</td>
                <td>{user.age}</td>
                <td>{user.subscription}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-users">No users found</div>
      )}
    </div>
  );
};

export default UserDetails;
