# 🏨 Hostel Management

**A Comprehensive Hostel Management System for BMSIT**  
Built with **Node.js**, **Express**, **MongoDB**, and **EJS**.  
Streamlines hostel operations for **students**, **wardens**, **chief wardens**, **security**, and **cleaning staff** — providing tailored dashboards and seamless workflows.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)  
[![Node.js](https://img.shields.io/badge/Node.js-v18.x-brightgreen)](https://nodejs.org/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-v6.x-green)](https://www.mongodb.com/)  
[![Twilio](https://img.shields.io/badge/Twilio-API-blue)](https://www.twilio.com/)  
[![GitHub stars](https://img.shields.io/github/stars/yourusername/HOSTELMan?style=social)](https://github.com/yourusername/HOSTELMan/stargazers)

---

## 🚀 Table of Contents

- [✨ Features](#-features)  
- [🗂 Project Structure](#-project-structure)  
- [⚙️ Installation](#-installation)  
- [💻 Usage](#-usage)  
- [🔑 Environment Variables](#-environment-variables) 
- [🛠 Technologies Used](#-technologies-used)  
- [📄 License](#-license) 
---

## ✨ Features

| Role          | Key Features                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------|
| 🎓 Students   | View personal, room & fee details; submit complaints & leave requests; track status          |
| 🛎️ Wardens    | Allocate/vacate rooms; manage students; handle complaints & leaves; send SMS notifications    |
| 🏢 Chief Warden | Manage blocks & rooms; assign wardens; oversee hostel occupancy                              |
| 🚨 Security   | Log student/staff entry-exit; manage and view security logs                                  |
| 🧹 Cleaning   | Mark & track room cleaning status; password-protected dashboard                              |
| 🔐 Auth       | Role-based secure login system for all user types                                            |
| 📲 Notifications | SMS alerts to parents via Twilio API                                                     |

---

## 🗂 Project Structure

```plaintext
HostelManagement/
├── app.js
├── package.json
├── README.md
├── .gitignore
├── complaint.txt
├── leave.txt
├── config/
│   └── twilio.js
├── images/
│   ├── Building.jpg
│   ├── dine.jpg
│   ├── image1.jpeg
│   ├── mess.jpeg
│   ├── room.jpg
│   └── sports.jpeg
├── models/
│   ├── Log.js
│   └── models.js
├── routes/
│   ├── chief.js
│   ├── cleaning.js
│   ├── security.js
│   ├── student.js
│   └── warden.js
└── views/
    ├── chiefwardendash.ejs
    ├── home.ejs
    ├── wardendash.ejs
    ├── cleaning/
    │   └── dashboard.ejs
    ├── security/
    │   └── dashboard.ejs
    └── student/
        └── dashboard.ejs


⚙️ Installation
# Clone the repo
git clone https://github.com/yourusername/HOSTELMan.git
cd HOSTELMan

# Install dependencies
npm install

# Create .env file and add your config (see below)
touch .env

# Start the server
npm start

Environment Variables .env
MONGO_URI=your_mongodb_connection_string
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

Usage
Select your role on the homepage to log in.
Students use roll number and contact number to log in.
Other roles use role-based credentials.
Use the dashboard features as per your role.

## 🚀 Technologies Used
<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" />
  <img src="https://img.shields.io/badge/EJS-8FBC8F?style=for-the-badge&logo=handlebarsdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Twilio-FF0000?style=for-the-badge&logo=twilio&logoColor=white" />
  <img src="https://img.shields.io/badge/Dotenv-000000?style=for-the-badge&logo=dotenv&logoColor=white" />
</div>

License
MIT License — see the LICENSE file.
