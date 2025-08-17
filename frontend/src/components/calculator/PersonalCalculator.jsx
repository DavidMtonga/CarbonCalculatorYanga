// import { useState } from "react";
// import {
//   Button,
//   Slider,
//   Typography,
//   Box,
//   Grid,
//   TextField,
//   InputAdornment,
// } from "@mui/material";
// import { calculatePersonalEmissions } from "../../services/calculatorService";

// const PersonalCalculator = ({ onCalculate }) => {
//   const [values, setValues] = useState({
//     commute: 20,
//     waste: 5,
//     electricity: 300,
//     meals: 3,
//   });

//   const handleSliderChange = (name) => (event, newValue) => {
//     setValues({ ...values, [name]: newValue });
//   };

//   const handleMealsChange = (delta) => {
//     const newValue = values.meals + delta;
//     if (newValue >= 1 && newValue <= 10) {
//       setValues({ ...values, meals: newValue });
//     }
//   };

//   const handleCalculate = () => {
//     const result = calculatePersonalEmissions(values);
//     onCalculate({
//       type: "personal",
//       data: values,
//       result: result.total,
//       details: result.details,
//     });
//   };

//   return (
//     <Box sx={{ mt: 3 }}>
//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <Typography gutterBottom>Daily Commute Distance (km)</Typography>
//           <Slider
//             value={values.commute}
//             onChange={handleSliderChange("commute")}
//             min={0}
//             max={200}
//             step={1}
//             valueLabelDisplay="auto"
//           />
//           <TextField
//             fullWidth
//             value={values.commute}
//             onChange={(e) =>
//               setValues({ ...values, commute: Number(e.target.value) })
//             }
//             type="number"
//             InputProps={{
//               endAdornment: <InputAdornment position="end">km</InputAdornment>,
//             }}
//           />
//         </Grid>

//         {/* Add other input fields similarly... */}

//         <Grid item xs={12}>
//           <Button
//             variant="contained"
//             color="primary"
//             fullWidth
//             onClick={handleCalculate}
//             sx={{ py: 2 }}
//           >
//             Calculate Personal Emissions
//           </Button>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default PersonalCalculator;
