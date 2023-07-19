import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import AccountMenu from './AccountMenu';
import BasicForm from './BasicForm'

import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

export default function App() {
	const [openForm, setOpenForm] = React.useState(false);
	const handleOnClick = (page) => {
		console.log('open');
		if(!openForm) { 
			setOpenForm(true)
		} else {
			setOpenForm(false)
		}
	};
  return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={
					<>
						<Container maxWidth="sm">
							<AccountMenu onClick={handleOnClick} />
							<Outlet />
						</Container>
					</>
				}>
					<Route index element={
						<>
							<Box sx={{ my: 4 }}>
								<Typography variant="h4" component="h1" gutterBottom>
									React Skills test
								</Typography>
							</Box>
						</>
						} 
					/>
					<Route path="/contact" element={
						<>
							<h1>The Contact</h1>
						</>
						} 
					/>
					<Route path="/profile" element={
						<>
							<h1>The Profile</h1>
						</>
						} 
					/>
					<Route path="/todo" element={
						<>
							<BasicForm />
						</>
						} 
					/>
				</Route>
			</Routes>
		</BrowserRouter>
  );
}
