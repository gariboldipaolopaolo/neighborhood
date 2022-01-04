/* eslint-disable */
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import DownloadIcon from '@mui/icons-material/Download';

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import {useState} from "react";
import Button from "@mui/material/Button";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [result, setResult] = useState(0);
  const [data, setData] = useState("");
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
      debugger;
      const newMatrix = trasformaMatrix(matrix, lineNum, rowNum);
      generateLpSolveText(newMatrix);
    };
    reader.readAsText(e.target.files[0]);
  };

  const generateLpSolveText = (matrix) => {
    let text = "";
    text += "\nmin: ";

    for(let riga=0; riga < matrix.length; riga++){
      for(let col=0; col < matrix[riga].length; col++){
        text += `\n${matrix[riga][col]}*m${riga}j${col}`;
        if(col!=matrix[riga].length-1){
          text += "\n+";
        }
      }
      text += "\n";
    }

    text += "\n\nConstraints: ";

    let newriga =0;
    let temp=0;
    for(let col=0; col< matrix[newriga].length; col++){
      for(; newriga< matrix.length;newriga++){
        text += `\nm${newriga}j${col}`;
        if(newriga!=matrix.length-1){
          text += "\n+";
        }
      }
      newriga=temp;
      text += "\n=1;";
    }

    setData(text);
  };

  const trasformaMatrix = (matrix, matrixRowLength, matrixColLength) => {
    let lineNum = ((matrix[0].length) / 2) - 1;
    const colNum = matrix.length;

    const newMatrix = new Array(lineNum);
    for (let i = 0; i < newMatrix.length; i++) {
      newMatrix[i] = new Array(colNum);
    }

    let newMatrixRow =0;
    let newMatrixCol;
    for(let matrixCol = 1; matrixCol < matrixColLength - 2; matrixCol++){
      newMatrixCol = 0;
      for(let matrixRow=0; matrixRow < matrixRowLength; matrixRow++){
        newMatrix[newMatrixRow][newMatrixCol]=matrix[matrixRow][matrixCol];
        newMatrixCol++;
      }
      newMatrixRow++;
      matrixCol++;
    }

    return newMatrix;
  };

  const download = (data, filename, type) => {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      var a = document.createElement("a"),
          url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mt={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3}>
                <Button variant="contained" component="label">
                  <input type="file" onChange={(e) => handleFile(e)} />
                </Button>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                  icon="download"
                  title="LPSOLVE/CPLEX"
                  count=".lpt"
                  percentage={{
                    color: "success",
                    label: "Download LPSOLVE/CPLEX file",
                  }}
                  download={() => download(data,"result.lpt","text")}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                  color="success"
                  icon="store"
                  title="Revenue"
                  count="34k"
                  percentage={{
                    color: "success",
                    amount: "+1%",
                    label: "than yesterday",
                  }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                  color="primary"
                  icon="person_add"
                  title="Followers"
                  count="+91"
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Just updated",
                  }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                    color="info"
                    title="website views"
                    description="Last Campaign Performance"
                    date="campaign sent 2 days ago"
                    chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                    color="success"
                    title="daily sales"
                    description={
                      <>
                        (<strong>+15%</strong>) increase in today sales.
                      </>
                    }
                    date="updated 4 min ago"
                    chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                    color="dark"
                    title="completed tasks"
                    description="Last Campaign Performance"
                    date="just updated"
                    chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
