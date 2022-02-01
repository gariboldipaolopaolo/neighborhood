import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";
import {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import {TextField} from "@mui/material";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const [result, setResult] = useState(0);
  const [data, setData] = useState("");
  const [dataI, setDataI] = useState("");
  const [lpValue, setLpValue] = useState(0);
  const [lpIValue, setLpIValue] = useState(0);
  const [s0Value, setS0Value] = useState(0);
  const [difference, setDifference] = useState(new Date());
  const [isRunning, setIsRunning] = useState(false);
  const [isNRunning, setIsNRunning] = useState(false);
  const [jobMatrix, setJobMatrix] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [nworker, setNWorker] = useState(null);
  const [nValue, setNValue] = useState(0);
  const [bestScheduler, setBestScheduler] = useState([]);
  let nWorker;
  const [solIndex, setSolIndex] = useState(1);
  const [snDate, setSnDate] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [filename, setFileName] = useState("");

  const handleFile = async (e) => {
    const fullPath = document.getElementById('upload').value;
    if (fullPath) {
      const startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
      let filename = fullPath.substring(startIndex);
      if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
      }
      setFileName(filename.split(".")[0]);
    }
    debugger;
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;

      // By lines
      const lines = text.split("\n");
      const lineNum = lines.length - 2;
      const rowNum = lines[2].split("\t").length;
      const matrix = new Array(lineNum);

      for (let i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(rowNum - 2);
      }

      let line = 0;
      let t = 0;
      let riga = 0;

      while (line < lines.length) {
        if (t > 1) {
          const parts = lines[line].split("\t");
          if(parts[0] === '')
            parts.shift();
          if(parts[parts.length - 1] === '')
            parts.pop();
          let col = 0;
          for (let i = 0; i < parts.length; i++) {
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

      setJobMatrix(matrix);
      const newMatrix = trasformaMatrix(matrix, lineNum, rowNum);
      setMatrix(newMatrix)
      generateLpSolveText(newMatrix);
      generateLpISolveText(newMatrix);
    };
    reader.readAsText(e.target.files[0]);
  };

  const generateLpSolveText = (matrix) => {
    const newMatrix = matrix.map((x) => {
      if(typeof x[x.length - 1] === 'undefined')
        x.pop();
      return x;
    });

    let text = 'Minimize Z\n\nSubject To\n';
    let line = '';
    const jobNumRows = newMatrix[0].length;
    const macNumCol = newMatrix.length;
    let i = 0;
    while(i < jobNumRows){
      for(let m = 0 ; m < macNumCol ; m++){
        line += m !== macNumCol -1 ? `X${i}${m} + ` : `X${i}${m} = 1\n`;
      }
      i++;
    }

    for(let m = 0; m < newMatrix.length; m++){
      for (let j = 0 ; j < newMatrix[m].length ; j++){
        line += j !== newMatrix[m].length -1 ? `${newMatrix[m][j]} X${j}${m} + ` : `${newMatrix[m][j]} X${j}${m} -Z <= 0\n`;
      }
    }

    text += line;
    text += '\nbounds\nZ >= 0\n';
    line = '';
    for(let m = 0; m < newMatrix.length; m++){
      for (let j = 0 ; j < newMatrix[m].length ; j++){
        line += `X${j}${m} >= 0\n`;
      }
    }

    text += line;

    setData(text);
  };

  const generateLpISolveText = (matrix) => {
    const newMatrix = matrix.map((x) => {
      if(typeof x[x.length - 1] === 'undefined')
        x.pop();
      return x;
    });

    let text = 'Minimize Z\n\nSubject To\n';
    let line = '';

    const jobNumRows = newMatrix[0].length;
    const macNumCol = newMatrix.length;
    let i = 0;
    while(i < jobNumRows){
      for(let m = 0 ; m < macNumCol ; m++){
        line += m !== macNumCol -1 ? `X${i}${m} + ` : `X${i}${m} = 1\n`;
      }
      i++;
    }


    for(let m = 0; m < newMatrix.length; m++){
      for (let j = 0 ; j < newMatrix[m].length ; j++){
        line += j !== newMatrix[m].length -1 ? `${newMatrix[m][j]} X${j}${m} + ` : `${newMatrix[m][j]} X${j}${m} -Z <= 0\n`;
      }
    }

    text += line;
    text += '\ngeneral\nZ\n';
    line = '';
    for(let m = 0; m < newMatrix.length; m++){
      for (let j = 0 ; j < newMatrix[m].length ; j++){
        line += `X${j}${m}\n`;
      }
    }

    text += line;

    setDataI(text);
  };

  const trasformaMatrix = (matrix, matrixRowLength, matrixColLength) => {
    let lineNum = ((matrix[0].length) / 2);
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
    let file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      let a = document.createElement("a"),
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
  };

  const notify = () => toast("Inserire almeno un file!");

  const handleLpInputChange = (event) => {
      setLpValue(event.target.value);
  };
  const handleLpIInputChange = (event) => {
    setLpIValue(event.target.value);
  };

  const [s0Date, setS0Date] = useState("");
  const [sworker, setWorker] = useState(null);
  const [scheduler, setScheduler] = useState([]);
  let s0Worker;
  const findS0 = async () => {
    if(jobMatrix.length === 0){
      alert('Inserire almeno un istanza!');
      return;
    }
    if(lpValue === 0){
      alert('Inserire il valore trovato con LPSOLVER!');
      return;
    }

    s0Worker = new Worker('findS0Worker.js');
    setWorker(s0Worker);

    if(isRunning === false){
      setIsRunning(true);
    }
    const date = Date.now();
    const lastRunDate = `Il risultato risale all'operazione lanciata in data ${new Date(date)}`;
    setS0Date(lastRunDate);
    s0Worker.postMessage(matrix);

    s0Worker.onmessage = (ev) => {
      setS0Value(ev.data.maxTime);
      setScheduler(ev.data.scheduler);
      if(ev.data.finished){
        s0Worker.terminate();
        setIsRunning(false)
      }
    };
  };

  const terminateS0 = () => {
    sworker.terminate();
    setIsRunning(false);
  };

  const getData = () => {
    debugger;
    if(nValue === 0) return;
    let text = `${nValue} `;
    const scheduler = bestScheduler;
    let m = 0;
    for(let col = 0; col < scheduler[m].length; col++){
      for(let r = 0; r < scheduler.length; r++){
        if(scheduler[r][col] > 0){
          text += `${r} `;
        }
      }
    }
    download(text,`${filename}sol.txt` , "text");
  }

  const findN = async (scheduler) => {
    if(jobMatrix.length === 0){
      alert('Inserire almeno un istanza!');
      return;
    }
    if(lpValue === 0){
      alert('Inserire il valore trovato con LPSOLVER!');
      return;
    }
    if(s0Value === 0){
      alert('Trovare la soluzione S0!');
      return;
    }
    nWorker = new Worker('findNWorker.js');
    setNWorker(nWorker);

    if(isNRunning === false){
      setIsNRunning(true);
    }

    const date = Date.now();
    const lastRunDate = `Il risultato risale all'operazione lanciata in data ${new Date(date)}`;
    setSnDate(lastRunDate);
    setStartDate(new Date());
    nWorker.postMessage({matrix, scheduler , s0Value});

    nWorker.onmessage = (ev) => {
      setNValue(ev.data.bestSolution);
      setBestScheduler(ev.data.bestScheduler);
      if(ev.data.finished){
        nWorker.terminate();
        setIsNRunning(false);
      }
    };
  };

  useEffect(() => {
    const endTime = new Date();
    let timeDiff = endTime - startDate; //in ms
    // strip the ms
    timeDiff /= 1000;
    setDifference(timeDiff);
  },[nValue]);

  useEffect(() => {
    const index = solIndex + 1;
    setSolIndex(index);
  }, [nValue]);

  const [labels, setLabels] = useState([]);
  const [sn, setSn] = useState([]);

  const chartData = {
      labels: labels,
      datasets: { label: "Solutions", data: sn },
  };
  const [cdata, setCData] = useState({});

  useEffect(() => {
    setLabels([...labels, `S${solIndex}`]);
    setSn([...sn, nValue]);
    setCData(chartData);
  },[nValue]);

  const terminateN = () => {
    nworker.terminate();
    setIsNRunning(false);
  };

  let barChartData =  {
    labels: ["LPSOLVE","LPSOLVE INTEGER", "S0", "Neighborhood Algorithm"],
    datasets: { label: "unità", data: [lpValue, lpIValue, s0Value, nValue] },
  };
  const [barChartDataValue, setBarChartDataValue] = useState({});

  useEffect(() => {
    setBarChartDataValue(barChartData);
  }, [lpValue, s0Value ,nValue]);

  const [delta, setDelta] = useState(0);

  useEffect(() => {
    setDelta(nValue !== 0 && lpValue !== 0 ? ((nValue - lpValue) / lpValue) * 100 : 0);
  }, [lpValue, nValue]);



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mt={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3}>
                <Button variant="contained" component="label">
                  <input type="file" id={"upload"} onChange={(e) => handleFile(e)} />
                  <TextField
                      required
                      id="outlined-required"
                      label="LPSOLVE result"
                      value={lpValue}
                      onChange={handleLpInputChange}
                  />
                  <TextField
                      required
                      id="outlined-required"
                      label="LPSOLVE INTEGER result"
                      value={lpIValue}
                      onChange={handleLpIInputChange}
                  />
                </Button>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                  icon="download"
                  title="LPSOLVE/CPLEX"
                  count={`${lpValue}`}
                  percentage={{
                    color: "success",
                    label: "Scarica il file con la soluzione RILASSATA",
                  }}
                  action={() => download(data,"relaxed.lpt","text")}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                  icon="download"
                  title="LPSOLVE/CPLEX"
                  count={`${lpIValue}`}
                  percentage={{
                    color: "success",
                    label: "Scarica il file con la soluizione INTERA",
                  }}
                  action={() => download(dataI,"integer.lpt","text")}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              {!isRunning
                  ? (<ComplexStatisticsCard
                      color={"success"}
                      icon={"S"}
                      title="Soluzione S0"
                      count={`${s0Value}`}
                      percentage={{
                        color: "success",
                        label: "Trova la soluzione S0",
                      }}
                      action={() => findS0()}
                  />)
                  : (<ComplexStatisticsCard
                      color={"error"}
                      icon={"stop"}
                      title="Soluzione S0"
                      count={`${s0Value}`}
                      percentage={{
                        color: "success",
                        label: "Trova la soluzione S0",
                      }}
                      action={() => terminateS0()}
                  />)
              }

            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              {!isNRunning
                  ? (<ComplexStatisticsCard
                      color={"success"}
                      icon={"N"}
                      title="Soluzione Neighborhood"
                      count={`${nValue}`}
                      percentage={{
                        color: "success",
                        label: "Trova la soluzione Neighborhood",
                      }}
                      action={() => findN(scheduler)}
                  />)
                  : (<ComplexStatisticsCard
                      color={"error"}
                      icon={"stop"}
                      title="Soluzione Neighborhood"
                      count={`${nValue}`}
                      percentage={{
                        color: "success",
                        label: "Trova la soluzione Neighborhood",
                      }}
                      action={() => terminateN()}
                  />)
              }
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3}>
                <ReportsLineChart
                    color="dark"
                    title="Soluzioni locali"
                    description={`La migliore delle soluzioni locali è: ${nValue} trovata dopo: ${nValue === 0 ? 0 : difference}ms`}
                    date={snDate}
                    chart={cdata}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3}>
                <ReportsBarChart
                    color="info"
                    title="MAKESPAN"
                    description={`La % di errore è del: ${delta}%. Il valore ottimo si trova tra ${lpValue} e ${nValue}`}
                    date={s0Date}
                    chart={barChartDataValue}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3}>
                <Button id={"upload"} onClick={getData}>
                  SCARICA FILE SOLUZIOME
                </Button>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
