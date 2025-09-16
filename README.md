Wareify: Blockchain-Based Inventory Management System

Overview

Wareify is a Inventory management system powered by blockchain technology. It is designed to streamline inventory tracking and improve transparency throughout the supply chain. By using RFID technology, Wareify allows real-time, tamper-proof logging of product movements, giving businesses a secure and immutable record of their inventory.

Features

The system offers blockchain integration that ensures all inventory transactions are permanently recorded and cannot be altered. RFID scanning allows for real-time monitoring of products as they move in and out of the warehouse. User authentication provides secure access control for different roles, while product management enables efficient handling of product entries and exits. Shipment tracking lets users monitor and manage outgoing shipments, and the admin dashboard gives a complete overview of warehouse operations and analytics.

Technologies Used

The frontend of Wareify is built using HTML, CSS, and JavaScript, while the backend is powered by Node.js and Express.js. The system uses Ethereum blockchain technology along with Web3.js for decentralized transaction recording. MongoDB is used as the database for storing relevant data, and JWT (JSON Web Tokens) handles secure authentication. RFID integration is managed using Node-serialport and RFID.js to connect and read data from RFID devices.

Demo

To see Wareify in action, you can watch the demo video that showcases the system’s features and functionality. The video demonstrates how products are added, tracked, and managed within the warehouse environment. You can view the demo at the following link: https://drive.google.com/file/d/1Nfc-P7qbCxDM9HG9n4ej_sxzyV2JdJh5/view?usp=drive_link

Installation
Before running Wareify, you need to have Node.js version 14 or higher installed, along with a MongoDB database instance, either locally or in the cloud. An RFID reader compatible with Node.js is also required. After cloning the repository, install all backend dependencies by navigating to the backend folder and running the installation command. Create a .env file in the backend directory with the required configuration, including port, database URI, JWT secret, and RFID port. Once configured, start the backend server and frontend application. The system should then be accessible locally, allowing you to manage and track warehouse operations efficiently.
