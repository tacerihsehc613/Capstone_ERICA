const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//const { Post, Hashtag } = require('../models');
const { setStoreImage } = require('../models/store');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            const path= 'uploads/';
            fs.mkdirSync(path, { recursive: true });
            //cb(null, 'uploads/');
            cb(null, path);
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            console.log("ext: ", ext);
            cb(null, path.basename(file.originalname, ext) + Date.now() +ext);
            //const originalName = file.originalname;
            //cb(null, 'img/' + originalName);
        },
    }),
    limits: { filesize: 5 * 1024 * 1024},
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    //const encodedFilename = encodeURI(req.file.filename);
    //res.json({ url: `/img/${encodedFilename}`});
    res.json({ url: `/img/${req.file.filename}`});
}); 

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try{
        const query=`
            match (s:Store {name: $storeName}) SET s.img=$img
            return s.name as name,s.img as img
        `;
        /*const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.user.id,
        }); */
        //const encodedFilename = encodeURI(req.body.url);
        //const store = await setStoreImage(query, req.body.storeName, encodedFilename);
        const store = await setStoreImage(query, req.body.storeName, req.body.url);
        console.log("store");
        console.log(store);
        console.log(typeof(store));
        /* const hashtags = req.body.content.match(/#[^\s#]+/g);
        if (hashtags) {
            const result = await Promise.all(
                hashtags.map(tag => {
                    return Hashtag.findOrCreate({
                        where: { title: tag.slice(1).toLowerCase() },
                    })
                }),
            );
            await post.addHashtags(result.map(r => r[0]));
        }*/
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;