/* eslint-disable */
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import { useState } from "react";
import Button from "@mui/material/Button";

function Dashboard() {
  const [result, setResult] = useState(0);
  const date = Date.now();
  const lastRunDate = `Il risultato risale all'operazione lanciata in data ${new Date(date)}`;
  const description = `Il valore ottimo, alla peggio, si discosta dal nostro risultato del ${result}%`;
  const handleFile = async (e) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      console.log(text);

      // By lines
      const lines = text.split("\n");
      const lineNum = lines.length - 2;
      const rowNum = lines[2].split("\t").length;
      const matrix = new Array(lineNum);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(rowNum);
      }

      let line = 0;
      let t = 0;
      let riga = 0;

      while (line < lines.length) {
        if (t > 1) {
          const parts = lines[line].split("\t");
          parts.shift();
          parts.pop();
          let col = 0;
          for (let i = 0; i < rowNum - 2; i++) {
            let time;
            time = parseInt(parts[i]);
            matrix[riga][col] = time;
            col++;
          }
          riga++;
        }
        line++;
        t++;
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Risultato:"
                  description={description}
                  date={lastRunDate}
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <MDBox py={3}>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3}>
                <Button variant="contained" component="label">
                  Upload File
                  <input type="file" hidden onChange={(e) => handleFile(e)} />
                </Button>
                <h2>nome file</h2>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
