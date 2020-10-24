import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout } from "./Layout";
import Button from "@material-ui/core/Button";
import ClipLoader from "react-spinners/ClipLoader";
import { useHistory } from "react-router";

export default function ExecutionList() {
  const [executionList, setexecutionList] = useState([]);
  const [loading, setloading] = useState(true);
  const history = useHistory();
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  async function getTitle(item) {
    if (item.hasOwnProperty("data")) {
      if (item.data.hasOwnProperty("claim_title")) {
        return item.data.claim_title;
      }
    }
    return "not found";
  }

  async function getARNs() {
    let result = await axios.post(
      "https://oys6sr3oo2.execute-api.eu-central-1.amazonaws.com/dev/execution",
      {
        maxResults: 20,
        stateMachineArn:
          "arn:aws:states:eu-central-1:638900115631:stateMachine:BasicWorkflow",
      },
      headers
    );
    var Arnresults = result.data.executions.map(
      (execution) => execution.executionArn
    );
    return Arnresults;
  }

  async function getName(events) {
    for (const event of events) {
      if (
        "stateEnteredEventDetails" in event &&
        "name" in event.stateEnteredEventDetails
      ) {
        return event.stateEnteredEventDetails.name;
      }
    }
    return "not found";
  }

  async function getDetails(executionArns) {
    const asyncDescriptions = await Promise.all(
      executionArns.map(async (arn) => {
        const tempDescription = await axios.post(
          "https://wid4bo7v0k.execute-api.eu-central-1.amazonaws.com/alpha/describeexecution",
          {
            executionArn: arn.toString(),
          },
          headers
        );

        const executionHistories = await axios.post(
          "https://prf7e0psi7.execute-api.eu-central-1.amazonaws.com/beta/execution",
          {
            executionArn: arn.toString(),
            includeExecutionData: true,
            maxResults: 10,
            reverseOrder: true,
          },
          headers
        );

        const name = await getName(executionHistories.data.events);

        return [
          await getTitle(JSON.parse(tempDescription.data.input)),
          tempDescription.data.status,
          name,
          arn.toString(),
        ];
      })
    );
    return asyncDescriptions;
  }

  useEffect(() => {
    const fetchExecutions = async () => {
      const executionArns = await getARNs();
      const details = await getDetails(executionArns);
      let executions = details.map((detail) => {
        let title, status, state, arn;
        [title, status, state, arn] = detail;
        return [title, status, state, arn];
      });
      setexecutionList(executions);
    };
    (async () => {
      await fetchExecutions();
      setloading(false);
    })();
  }, []);

  const viewDetail = (arn) => {
    history.push("/execution-detail/" + arn);
  };

  return (
    <>
      <Layout>
        {loading ? (
          <ClipLoader size={150} color={"#123abc"} loading={loading} />
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>States</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {executionList.map((item, index) => (
                <tr key={index}>
                  <td>{item[0]}</td>
                  <td>{item[1]}</td>
                  <td>{item[2]}</td>
                  <td>
                    <div className="btn-container">
                      <Button
                        variant="text"
                        onClick={() => viewDetail(item[3])}
                      >
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Layout>
    </>
  );
}
