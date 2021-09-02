import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardFooter from "components/Card/CardFooter.js";
import FormControl from '@material-ui/core/FormControl';
import Table from "components/Table/Table.js";
import axios from 'axios';

const styles = {
    typo: {
      paddingLeft: "25%",
      marginBottom: "40px",
      position: "relative",
    },
    note: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      bottom: "10px",
      color: "#c0c1c2",
      display: "block",
      fontWeight: "400",
      fontSize: "13px",
      lineHeight: "13px",
      left: "0",
      marginLeft: "20px",
      position: "absolute",
      width: "260px",
    },
    cardCategoryWhite: {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0",
    },
    cardTitleWhite: {
      color: "#FFFFFF",
      marginTop: "0px",
      minHeight: "auto",
      fontWeight: "300",
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      marginBottom: "3px",
      textDecoration: "none",
    },
    addTokenDiv: {
        border: 1
    },
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none",
        "& small": {
          color: "#777",
          fontSize: "65%",
          fontWeight: "400",
          lineHeight: "1",
        },
    }
};
  
const useStyles = makeStyles(styles);

export default function TokenSettingsPage() {
    const classes = useStyles();
    const [token_name, setTokenName] = useState('')
    const [token_symbol, setTokenSymbol] = useState('')
    const [token_supply, setTokenSupply] = useState(0)
    const [token_list, setTokenList] = useState([])

    useEffect(() => {
        getAllToken()
    }, [])

    function getAllToken(){
        axios.get(`http://localhost:5000/api/admin/all-token`).then((response) => {
            let users = response.data.tokens
            let tokenArray = users.map(function (obj) {
                let newObj = {
                  "Token ID": obj.token_id,
                  "Token Symbol": obj.token_symbol,
                  "Token Balance": obj.token_balance,
                  "Token KYC Granted": obj.token_kyc_granted ? "TRUE" : "FALSE",
                  "Token Freeze Status": obj.token_is_frozen ? "TRUE" : "FALSE"
                }
                const propertyValues = Object.values(newObj);
                return propertyValues;
            });
            setTokenList(tokenArray)
      }).catch(error => {
          console.log(" ERROR ", error)
      });
    }

    function addNewToken(){
        axios({
            method: "POST",
            url: "http://localhost:5000/api/admin/create-token",
            data: {
                token_name,
                token_symbol,
                initial_supply: token_supply
            },
        }).then(res => {
            console.log("res", res);
        }).catch(err => {
            console.log("error in request", err);
        });
    }

    return (
        <div>
            <Card>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>Token Settings</h4>
                </CardHeader>
                <CardBody>
                    <FormControl>
                        <GridContainer>
                            <GridItem md={4}>
                                <CustomInput labelText="Token Name" id="token-name"
                                    formControlProps={{
                                        fullWidth: true
                                    }}
                                    inputProps={{
                                        onChange: (e) => setTokenName(e.target.value),
                                        type: "text",
                                        defaultValue: token_name
                                    }}
                                />
                            </GridItem>
                            <GridItem md={4}>
                                <CustomInput labelText="Token Symbol" id="token-symbol"
                                    formControlProps={{
                                        fullWidth: true
                                    }}
                                    inputProps={{
                                        onChange: (e) => setTokenSymbol(e.target.value),
                                        type: "text",
                                        defaultValue: token_symbol
                                    }}
                                />
                            </GridItem>
                            <GridItem md={4}>
                                <CustomInput labelText="Token Supply Amount" id="token-supply-amount"
                                    formControlProps={{
                                        fullWidth: true
                                    }}
                                    inputProps={{
                                        onChange: (e) => setTokenSupply(e.target.value),
                                        type: "number",
                                        defaultValue: token_supply
                                    }}
                                />
                            </GridItem>
                        </GridContainer>
                    </FormControl>
                </CardBody>
                <CardFooter>
                    <Button onClick={() => addNewToken()} color="primary">Add Token</Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>Token List</h4>
                </CardHeader>
                <CardBody>
                    <Table
                        tableHeaderColor="primary"
                        tableHead={["Token ID", "Token Symbol", "Token Balance", "Token KYC Granted", "Token Freeze Status"]}
                        tableData={token_list}
                    />
                </CardBody>
            </Card>
        </div>
    )
}