const path = require('path');
const fs =require('fs-extra');
const express = require('express');
const BrewNode = require('./cloudNode');
const bodyParser = require('body-parser');

const port = 18070+Math.floor(Math.random()*30);
console.log('starting node on ', port)
let node1 = new BrewNode(port);

node1.init();

const http_port = 3008; //+Math.floor(Math.random()*10);

let BrewHTTP = function (){
	const app = new express();

	app.use(bodyParser.json());
	app.use(express.static(path.join(__dirname, 'public')));

	app.get('/addNode/:port', (req, res)=>{
  	console.log('add host: '+req.params.port)
		node1.addPeer('localhost', req.params.port)
		res.send();
	})

	app.get('/showBlocks/', (req, res)=>{
		let blocks = node1.getStats();
		res.send({blocks:blocks});
	})

	app.get('/showMyBlocks/:teammember', (req, res)=>{
		let blocks = node1.getBlocksTeamMember(req.params.teammember);
		console.log(blocks);
		res.send({blocks:blocks});
	})

	app.post('/createblock/:teammember', (req, res)=>{
		// curl -F 'img_avatar=@/home/christian/Downloads/palo-alto-welcome.jpg' http://localhost:3008/createblock/christian
		node1.createCloudBlock(req, req.params.teammember)
		return res.send();
	})

	app.listen(http_port, () => {
		console.log(`http server up.. ${http_port}`);
	})
}

let httpserver = new BrewHTTP();
