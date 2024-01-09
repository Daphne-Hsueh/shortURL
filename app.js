const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const fs = require('fs').promises;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

//由短網址找長網址進行redirect
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

//撈JSON裡的資料
async function readJson() {
  try {
    const data = await fs.readFile('./data.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
    throw err; 
  }
}

//資料（生成的新短網址）寫進json
async function writeJson(data) {
    return fs.writeFile('./data.json', JSON.stringify(data, null, 2));
}

//確認長網址是否唯一
async function checkUniqueLongUrl(longUrl) {
  let jsonData = await readJson()
  const isUnique = !jsonData.some((item) => item.hasOwnProperty(longUrl));
  return isUnique
}

//確認生成的短網址是否唯一
function checkShortUnique(array, shortUrl) {
  for (const obj of array) {
    for (const key in obj) {
      let value = obj[key][0];
      if (value === shortUrl) {
        return false; 
      }
    }
  }
    return true; 
}

//生成短網址
function createShortUrl(){
  return "http://localhost:3000/short/" + randomString(5)
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

//從前端拿到長網址，確認長網址先前是否用過，生成新短or找舊短回傳前端
app.post('/return-short', async (req, res) => {
  const { longUrl } = req.body;
  const jsonData = await readJson()
  let shortUrl;
  let isUniqueShortUrl;
  const isUniqueLongUrl = await checkUniqueLongUrl(longUrl)
  if (!isUniqueLongUrl) {
    shortUrl = jsonData.find(obj => obj.hasOwnProperty(longUrl))[longUrl];
    return res.status(200).json({ shortUrl });
  }

  do {
    shortUrl = createShortUrl();
    isShortUrlExist = checkShortUnique(jsonData, shortUrl)
  } while (!isShortUrlExist);
  jsonData.push({ [longUrl]: [shortUrl] });
  try {
    await writeJson(jsonData, shortUrl)
  } catch (error) {
      console.log(error)
      return res.status(500).json({msg: "Error writing file"})  
  }
  return res.status(200).json({shortUrl})
});

// 找到長網址後redirect
app.get('/short/:code', async(req, res) => {
  const shortUrl = "http://localhost:3000/short/"+ req.params.code
  let jsonData = await readJson()
  let longUrl = findLongUrl(jsonData, shortUrl);
  console.log('要回傳的長網址',longUrl)
  if (longUrl) {
    res.redirect(longUrl); 
  } else {
    res.status(404).send('URL not found');
  }
})


app.listen(port, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});
