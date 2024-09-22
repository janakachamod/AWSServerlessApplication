import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import React from "react";
import AccountContext from "../Context/AccountContext.js";
import userPool from "./userPool";

const AccountState = (props) => {
  // Logout function
  const logout = async () => {
    return await new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.signOut();
        resolve(user);
      } else {
        reject("No user found");
      }
    });
  };

  // Get user session function
  const getsession = async () => {
    return new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession((err, session) => {
          if (err) {
            reject(err);
          } else {
            user.getUserAttributes((err, attributes) => {
              if (err) {
                reject(err);
              } else {
                const results = {};
                for (let attribute of attributes) {
                  const { Name, Value } = attribute;
                  results[Name] = Value;
                }
                // Store additional attributes in localStorage
                localStorage.setItem("first_name", results.name || "");
                localStorage.setItem("last_name", results.nickname || "");
                localStorage.setItem("userName", results.sub || "");
                localStorage.setItem("email", results.email || "");
                localStorage.setItem("phone", results.phone_number || "");
                localStorage.setItem("country", results["custom:country"] || "");
                localStorage.setItem("age", results["custom:age"] || "");
                localStorage.setItem("subscription", results["custom:subscription"] || "");
  
                // Resolve with session and attributes
                resolve({ user, ...session, ...results });
              }
            });
          }
        });
      } else {
        reject("No user found");
      }
    });
  };
  

  // User registration
  const signup = async (
    email,
    firstName,
    lastName,
    password,
    country,
    age,
    phone,
    subscription
  ) => {
    return new Promise((resolve, reject) => {
      // Define valid subscriptions for group assignment
    const groupSubscriptions = ['Family', 'Business'];
    
    // Validate subscription for 'Family' and 'Business', allow 'personal' without validation
    if (!groupSubscriptions.includes(subscription) && subscription !== 'Personal') {
      reject(new Error('Invalid subscription type. Allowed values are "Family", "Business", or "personal".'));
      return;
    }
      var attributeList = [];
  
      var FName = {
        Name: "name",
        Value: firstName || "",
      };
      var LName = {
        Name: "nickname",
        Value: lastName || "",
      };
      var Country = {
        Name: "custom:country",
        Value: country || "",
      };
      var Age = {
        Name: "custom:age",
        Value: age || "", // Ensure this is a string
      };
      var Subscription = {
        Name: "custom:subscription",
        Value: subscription || "",
      };
  
      // Ensure phone number is formatted correctly
      const formattedPhone = formatPhoneNumber(phone || ""); 
  
      var Phone = {
        Name: "phone_number",
        Value: formattedPhone,
      };
  
      attributeList.push(FName, LName, Country, Age, Phone, Subscription);
  
      userPool.signUp(email, password, attributeList, null, (err, data) => {
        if (err) {
          console.log("Failed to register", err.message);
          reject(err);
        } else {
          console.log("Account created successfully", data);
          resolve(data);
        }
      });
    });
  };
  

  // Helper function to format phone numbers
  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters from the phone number
    const cleaned = ('' + phone).replace(/\D/g, '');

    // Replace with your country's code, e.g., +94 for Sri Lanka
    return cleaned ? `+94${cleaned.replace(/^0/, '')}` : ''; // Remove leading zero if present
  };

  // User login
  const authenticate = async (Username, Password) => {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username,
        Pool: userPool,
      });
  
      const authDetails = new AuthenticationDetails({
        Username,
        Password,
      });
  
      user.authenticateUser(authDetails, {
        onSuccess: async (data) => {
          console.log("Login Success", data);
          localStorage.setItem("email", Username);
  
          try {
            const sessionAttributes = await getsession();
            console.log("Session Attributes", sessionAttributes);
  
            // Check user role and set in localStorage
            if (Username === "chamodjanaka90@gmail.com") {
              localStorage.setItem("role", "admin");
            } else {
              localStorage.setItem("role", "user");
            }
  
            // Resolve with data
            resolve(data);
          } catch (err) {
            console.error("Failed to get session", err);
            reject(err);
          }
        },
        onFailure: (err) => {
          console.log("Login Failed", err.message);
          reject(err);
        },
        newPasswordRequired: (data) => {
          console.log("New password required", data);
          resolve(data);
        },
      });
    });
  };
  
   // Change user password
   const changePassword = async (currentPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession((err, session) => {
          if (err) {
            reject(err);
          } else {
            user.changePassword(currentPassword, newPassword, (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          }
        });
      } else {
        reject("No user found");
      }
    });
  };

  // Update user attributes
  const updateUserAttributes = async (attributes) => {
    return new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession((err, session) => {
          if (err) {
            reject(err);
          } else {
            const attributeList = Object.keys(attributes).map((key) => ({
              Name: key,
              Value: attributes[key],
            }));
  
            user.updateAttributes(attributeList, (err, result) => {
              if (err) {
                if (err.code === 'NotAuthorizedException') {
                  console.error('Unauthorized to update attribute:', err.message);
                }
                reject(err);
              } else {
                resolve(result);
              }
            });
          }
        });
      } else {
        reject("No user found");
      }
    });
  };
  
  const deleteAccount = async () => {
    return new Promise((resolve, reject) => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession((err, session) => {
          if (err) {
            reject(err); // Error getting session
          } else {
            // Ensure session is valid
            if (session.isValid()) {
              user.deleteUser((err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            } else {
              reject("Session is not valid");
            }
          }
        });
      } else {
        reject("No user found");
      }
    });
  };
  

  return (
    <AccountContext.Provider
      value={{ signup, authenticate, getsession, logout, updateUserAttributes, changePassword,deleteAccount }}
    >
      {props.children}
    </AccountContext.Provider>
  );
};

export default AccountState;
