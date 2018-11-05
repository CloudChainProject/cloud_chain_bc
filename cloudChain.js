const fs = require('fs');
const Crypto = require('crypto');
const formidable = require('formidable');
const cryptoFile = require('crypto-file');
const BrewChain = function() {
	let chain = [];
	let currentBlock = {};
	let genesisBlock = {};

	const init = () => {
		genesisBlock = {
      index: 0,
		  timestamp: 1511818270000,
		  data: 'our genesis data',
		  previousHash: "-1",
		  nonce: 0,
      owner: 'genesis'
		};

		genesisBlock.hash = createHash(genesisBlock);
		chain.push(genesisBlock);
		currentBlock = genesisBlock;
		fs.writeFile('./blocks/1511818270000.json', JSON.stringify(genesisBlock), 'utf8', ()=>{console.log('init colmplete');});
	}

	const createHash = ({ timestamp, data, index, previousHash, nonce }) => {
		return Crypto.createHash('SHA256').update(timestamp+data+index+previousHash+nonce).digest('hex');
	}

	const addToChain = (block) => {

		if(checkNewBlockIsValid(block, currentBlock)){
			chain.push(block);
			currentBlock = block;
			return true;
		}

		return false;
	}

	// const createBlock = (data, owner) => {
	// 	console.log(owner);
	// 	let newBlock = {
	// 	  timestamp: new Date().getTime(),
	// 	  data: data,
	// 	  index: currentBlock.index+1,
	// 	  previousHash: currentBlock.hash,
	// 	  nonce: 0,
  //     owner: owner
	// 	};
	//
	// 	newBlock = proofOfWork(newBlock);
	// 	fs.writeFile(`./blocks/${newBlock.timestamp}.json`, JSON.stringify(newBlock), 'utf8', ()=>{	});
	// 	return newBlock
	// }

	const proofOfWork = (block) => {

		while(true){
			block.hash = createHash(block);
			if(block.hash.slice(-3) === "000"){
				return block;
			}else{
				block.nonce++;
			}
		}
	}

	const getLatestBlock = () => {
		return currentBlock;
	}

	const getTotalBlocks = () => {
		return chain.length;
	}

	const getChain = () => {
		return chain;
	}

	const replaceChain = (newChain) => {
		chain = newChain;
		currentBlock = chain[chain.length-1];
	}

	const checkNewBlockIsValid = (block, previousBlock) => {
		if(previousBlock.index + 1 !== block.index) return false;
		else if (previousBlock.hash !== block.previousHash return false;
		else if(!hashIsValid(block)) return false;
		return true;
	}

	const hashIsValid = (block) => {
		return (createHash(block) == block.hash);
	}

	const checkNewChainIsValid = (newChain) => {
		if(createHash(newChain[0]) !== genesisBlock.hash ) return false;

		let previousBlock = newChain[0];
		let blockIndex = 1;

    while(blockIndex < newChain.length){
    	let block = newChain[blockIndex];

    	if(block.previousHash !== createHash(previousBlock)) return false;
    	if(block.hash.slice(-3) !== "000") return false;

    	previousBlock = block;
    	blockIndex++;
    }

    return true;
	}

	const getTotalBlocksTeamMember = (teamMember) =>{
		let blocks = []
		chain.map((i)=> {
			if (i.owner === teamMember) return blocks.push(i);
		})
		return blocks
	}

	const createNewCloudBlock = async (req, teammember) =>{
		return new Promise (async (resolve, reject) => {
			let data = {}, newBlock;
			const form = new formidable.IncomingForm();
			form.uploadDir = `./files/${teammember}/`;
			form.keepExtensions = true;

			return form.parse(req, function(err, fields, files) {
				data.size = files.img_avatar.size;
				data.path = files.img_avatar.path;
				data.name = files.img_avatar.name;
				data.type = files.img_avatar.type;
				data.lastModifiedDate = files.img_avatar.lastModifiedDate;

				var algorithm = 'sha1', shasum = Crypto.createHash(algorithm)

				var filename = __dirname + `/${data.path}`, s = fs.ReadStream(filename)
				s.on('data', function(data) {
					shasum.update(data)
				})

				s.on('end', function() {
					data.file_hash = shasum.digest('hex')

					newBlock = {
					  timestamp: new Date().getTime(),
					  data: data,
					  index: currentBlock.index+1,
					  previousHash: currentBlock.hash,
					  nonce: 0,
				    owner: teammember
					};
					newBlock = proofOfWork(newBlock);
					fs.writeFile(`./blocks/${newBlock.timestamp}.json`, JSON.stringify(newBlock), 'utf8', ()=>{	});
					console.log('block created');
					return resolve(newBlock)
				})
			});
		})
	}

	return {
		init,
		// createBlock,
		addToChain,
		checkNewBlockIsValid,
		getLatestBlock,
		getTotalBlocks,
		getChain,
		checkNewChainIsValid,
		replaceChain,
		getTotalBlocksTeamMember,
		createNewCloudBlock
	};
};

module.exports = BrewChain;
