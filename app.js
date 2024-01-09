const express = require('express');
const path = require('path');
const app = express();
const port = 3000;


const fs = require('fs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 找到長網址後redirect
app.get('/short/:code', (req, res) => {
  let shortUrl = "http://localhost:3000/short/"
  shortUrl += req.params.code
  fs.readFile('./data.json', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading file');
    }
    let jsonData = JSON.parse(data);
    let longUrl = findLongUrl(jsonData, shortUrl);
    console.log('要回傳的長網址',longUrl)
    if (longUrl) {
      res.redirect(longUrl); 
    } else {
      res.status(404).send('URL not found');
    }
  })
})

//從短網址找長網址
function findLongUrl(array, shortUrl) {
  for (const obj of array) {
    for (const key in obj) {
      if (obj[key].includes(shortUrl)) {
        return key;
      }
    }
  }
  return null; 
}

//從前端拿到長網址，比對長網址唯一性後，生成短網址回傳前端
app.post('/return-short',  (req, res) => {
  const {longUrl} = req.body;
  
  fs.readFile('./data.json', async (err, data) => {
  if (err) {
      return res.status(500).send('Error reading file');
    }
    
    let jsonData = JSON.parse(data);
    let shortUrl = ""
    let ifUnique = await ckLongUrl(longUrl)
    if (ifUnique === true){
      shortUrl = createShortUrl()
      jsonData.push({[longUrl]:[shortUrl]});
      fs.writeFile('./data.json', JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {                    
          console.error('Error writing file', err);
          res.status(500).send('Error writing file');
          return; 
        }
        console.log('new short URL saved successfully')
        return res.status(200).json({shortUrl})
      });
    } else if (ifUnique === false) {
      shortUrl = jsonData.find(obj => obj.hasOwnProperty(longUrl))[longUrl];
      return res.status(200).json({shortUrl})
    }
  });
});

//確認長網址是否唯一
function ckLongUrl(longUrl) {
  return new Promise((resolve, reject) => {
    fs.readFile('./data.json', (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        reject(err);
      } else {
        const jsonData = JSON.parse(data);
        const isUnique = !jsonData.some((item) => item.hasOwnProperty(longUrl));
        resolve(isUnique);
      }
    });
  });
}

//生成短網址
function createShortUrl(){
  let newShortUrl = "http://localhost:3000/short/"
  return newShortUrl += randomString(5)
}

//生成五碼亂碼
function randomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let random = ""
  for (let i = 0; i < 5; i++ ) {
    random += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return random
}

app.listen(port, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});
