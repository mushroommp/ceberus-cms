import React, { useState, useEffect } from 'react'
import {
    Table
} from 'reactstrap';
import axios from "axios";
import './Dashboard.css';

const Dashboard = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        getAllUsers()
    }, [/*Here can enter some value to call again the content inside useEffect*/])

    function getAllUsers(){
        axios.get(`http://localhost:5000/api/users/all`).then((response) => {
            console.log(" RESPONSE ", response)
            setUsers(response.data);
        }).catch(error => {
            console.log(" ERROR ", error)
        });
    }

    return (
        <div className="Dashboard">
            <div className="table-container">
                <Table bordered>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Hedera Private Key</th>
                            <th>Hedera Public Key</th>
                            <th>Hedera Account ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.length > 1 &&
                            users.map((item, index) => {
                                return (
                                    <tr>
                                        <td>{item.name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.hederaAccountId}</td>
                                        <td>{item.hederaPrivateKey}</td>
                                        <td>{item.hederaPublicKey}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </div>
        </div>
    )
}

export default Dashboard