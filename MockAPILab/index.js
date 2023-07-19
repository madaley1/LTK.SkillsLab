const express = require('express');
const app = express();
const port = 3500;
const isLocal = true;

const mysql = require('mysql');

//database connection
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'ltknodejs'
});

//functions
function getAllLoans(){
	return new Promise((resolve, reject) => {
		connection.query('SELECT * FROM loans', (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

function getAllBorrowers(){
	return new Promise((resolve, reject) => {
		let query = `SELECT * FROM borrowers`;
		connection.query(query, (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

function getLoanById(id){
	return new Promise((resolve, reject) => {
		connection.query(`SELECT * FROM loans WHERE loanId = ${id}`, (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

function getBorrowersByPairId(borrowers){
	return new Promise((resolve, reject) => {
		let query = `SELECT * FROM borrowers WHERE`;
		console.log(borrowers)
		borrowers.forEach((borrower, index) => {
			query += `  (pairId = ${borrower})`;
			if(index !== borrowers.length - 1){
				query += ' OR';
			}
		});
		connection.query(query, (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

function createNewLoan(pairIds){
	return new Promise((resolve, reject) => {
		const ids = pairIds.join(',');
		connection.query(`INSERT INTO loans (pairIds) VALUES ('${ids}')`, (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

function createNewBorrower(firstName, lastName, phone){
	return new Promise((resolve, reject) => {
		connection.query(`INSERT INTO borrowers (firstName, lastName, phone) VALUES ('${firstName}', '${lastName}', '${phone}')`, (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

function updateBorrowerById(id, updates){
	return new Promise((resolve, reject) => {
		let query = `UPDATE borrowers SET `;
		updates.forEach((entry, index)=>{
			query += `${entry[0]} = '${entry[1]}'`;
			if(index !== updates.length - 1){
				query += ', ';
			}
		});
		query += ` WHERE pairId = ${id}`;
		connection.query(query, (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

function updateLoanById(id, pairIds){
	return new Promise((resolve, reject) => {
		let query = `UPDATE loans SET pairIds = '${pairIds}' WHERE loanId = ${id}`;
		connection.query(query, (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

function deleteBorrowerById(id){
	return new Promise((resolve, reject) => {
		let query = `DELETE FROM borrowers WHERE pairId = ${id}`;
		connection.query(query, (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

function deleteLoanById(id){
	return new Promise((resolve, reject) => {
		let query = `DELETE FROM loans WHERE loanId = ${id}`;
		connection.query(query, (err, rows) => {
			if(err) reject(err);
			resolve(rows);
		});
	});
}

app.get('/', (req, res) => {
    res.json({
		message: "✨ 👋🌏 ✨",
		stage: process.env.NODE_ENV,
	});
});

app.get("/ping", (req, res) => {
	res.json({
		message: "🏓",
	});
});

app.get("/loans", (req, res) => {
	Promise.all([getAllLoans(), getAllBorrowers()])
		.then(([loans, borrowers]) => {
			const loanObjects = loans.map((element) => {
				const pairIds = element.pairIds.split(',');
				console.log(pairIds);
				const loanBorrowers = [] 
				borrowers.forEach((borrower)=>{
					console.log(pairIds.indexOf(`${borrower.pairId}`) > -1);
					if(pairIds.indexOf(`${borrower.pairId}` ) !== -1){
						loanBorrowers.push( borrower);		
					}
				})
				return {loanId: element.loanId, borrowers: loanBorrowers}
			});
				res.json({
					loanObjects
				});
		})
		.catch((err) => {console.error(err)});
});

app.get('/loans/:id', (req, res)=>{
	const {originalUrl} = req;
	const id = originalUrl.split('/')[2];
	getLoanById(id)
	.then((loan)=>{
		const pairIds = loan[0].pairIds.split(',');
		console.log(pairIds)
		getBorrowersByPairId(pairIds).then((borrowers)=>{
			res.json({
				loanId: loan[0].loanId,
				borrowers
			});
		}).catch((err)=>{console.error(err)});
	})
	.catch((err) => {console.error(err)});

});

app.post('/loans', (req, res)=>{
	const pairIds = req.query.pairIds.split(',');
	console.log(pairIds);
	createNewLoan(pairIds).then((loan)=>{
		res.json({
			message: 'loan created',
		});
	}).catch((err)=>{console.error(err)});
});

app.post('/borrowers', (req, res)=>{
	const {firstName, lastName, phone} = req.query;
	createNewBorrower(firstName, lastName, phone).then(()=>{
		res.json({
			message: 'borrower created',
		});
	}).catch((err)=>{console.error(err)});
});

app.patch('/loans/:id', (req, res)=>{
	const {originalUrl} = req;
	const splitURL = originalUrl.split('/')[2];
	const id = splitURL.split('?')[0];
	const pairId = req.query.pairId;
	const updates = [];
	Object.keys(req.query).forEach((key)=>{
		if(key !== 'pairId'){
			updates.push( [key, req.query[key]]);
		}
	});
	console.log(updates)
	getLoanById(id)
		.then((loan)=>{
			const pairIds = loan[0].pairIds.split(',');
			console.log(pairIds)
			if(pairIds.indexOf(pairId) === -1){
				res.json({
					message: 'pairId not found in loan',
				})
			}
			updateBorrowerById(pairId, updates)
				.then(()=>{
					res.json({
						message: 'borrower updated',
					});
				})
				.catch((err)=>{console.error(err)});
		})
		.catch((err)=>{console.error(err)});
});

app.delete('/borrowers/:id', (req, res)=>{
	const {originalUrl} = req;
	const splitURL = originalUrl.split('/')[2];
	const pairId = splitURL.split('?')[0];
	const loanId = req.query.loanId;
	getLoanById(loanId)
		.then((loan)=>{
			const pairIds = loan[0].pairIds.split(',');
			if(pairIds.indexOf(pairId) === -1){
				res.json({
					message: 'pairId not found in loan',
				})
			}
			const index = pairIds.indexOf(pairId);
			const updatedPairIds = pairIds;
			if(index > -1){
			 updatedPairIds.splice(index, 1);
			}
			console.log(updatedPairIds)
			deleteBorrowerById(pairId)
				.then(()=>{
					updateLoanById(loanId, updatedPairIds).then(
						res.json({
							message: 'borrower deleted',
						})
					).catch((err)=>{console.error(err)});
					
				})
				.catch((err)=>{console.error(err)});
		})
		.catch((err)=>{console.error(err)});
});

app.delete('/loans/:id', (req, res)=>{
	const {originalUrl} = req;
	const splitURL = originalUrl.split('/')[2];
	const id = splitURL.split('?')[0];
	
	deleteLoanById(id).then(()=>{
		res.json({
			message: 'loan deleted',
		});
	}).catch((err)=>{console.error(err)});
});

if (isLocal) {
	//local host
	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`)
	});
} else {
	//for lambda export
	module.exports = app;
}
