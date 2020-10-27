import React, { useState } from "react";
import axios from "axios";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { Layout } from "./Layout";
import { Alert } from "reactstrap";
import aws4 from 'aws4';

const useStyles = makeStyles((theme) => ({
  title: {
    marginTop: 30,
  },
  "@global": {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
  },
  step: {
    width: "100%",
    margin: 50,
    alignItems: "center",
  },
  cardHeader: {
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
  },
  cardContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: theme.spacing(2),
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[100]
        : theme.palette.grey[700],
  },

  paper: {
    marginTop: 50,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    marginBottom: 300,
  },
}));

export default function ClaimForm() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [visible, setVisible] = useState(false);
  const classes = useStyles();
  const onDismiss = () => setVisible(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = {
      id: "573cf6e7-8caf-46f2-9805-bab6771066f2",
      claim_title: title,
      submitted_by: name,
      amount: amount,
      contract_id: "f8511f21-9d77-45c9-b0c3-fd0b2697c747",
      principal_id: "3d48d94c-9b1f-451a-b6cb-690f87789c60",
      superintendent_id: "9e8c8da9-4e47-4f7f-b32e-1628eddc5b8c",
    };

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    };
    let request = {
      host: 'wid4bo7v0k.execute-api.eu-central-1.amazonaws.com',
      method: 'POST',
      url: `https://wid4bo7v0k.execute-api.eu-central-1.amazonaws.com/alpha/start`,
      data: data, // object describing the data
      body: JSON.stringify(data), // aws4 looks for body; axios for data
      path: `/alpha/start`,
      headers: {
        'content-type': 'application/json'
      }
    }

    let signedRequest = aws4.sign(request,
      {
        // assumes user has authenticated and we have called
        // AWS.config.credentials.get to retrieve keys and
        // session tokens
        secretAccessKey: process.env.REACT_APP_SECRETACCESSKEY,
        accessKeyId: process.env.REACT_APP_ACCESSKEYID
      })
    
    delete signedRequest.headers['Host']
    delete signedRequest.headers['Content-Length']
  
    await axios(signedRequest)

    setVisible(true);
    setName("");
    setAmount("");
    setTitle("");
  };

  return (
    <>
      <Layout>
        <Alert color="info" isOpen={visible} toggle={onDismiss}>
          Payment claim has been submitted!
        </Alert>
        <form onSubmit={handleSubmit} className={classes.title}>
          <Typography component="h1" variant="h2">
            Workflow System{" "}
          </Typography>{" "}
          <Typography component="h1" variant="h4">
            AS4000{" "}
          </Typography>{" "}
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Name"
                name="name"
                autoFocus
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />{" "}
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="amount"
                label="Amount"
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />{" "}
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="claim title"
                label="Claim Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                id="claimTitle"
              />
            </div>{" "}
          </Container>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className="rem_sub">
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Submit{" "}
              </Button>{" "}
            </div>{" "}
          </Container>{" "}
        </form>{" "}
      </Layout>{" "}
    </>
  );
}
