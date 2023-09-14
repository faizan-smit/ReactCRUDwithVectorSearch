
import express from 'express';
// import { nanoid } from 'nanoid'
import { customAlphabet } from 'nanoid'
import {client} from './../mongodb.mjs'
import { ObjectId } from 'mongodb';
import pineconeClient, { openai as openaiClient }
    from './../pinecone.mjs';

let router = express.Router();
const dbName = "CRUD-DB";
const db = client.db(dbName);
const col = db.collection("posts");


const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
const pcIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME);
console.log("process.env.PINECONE_INDEX_NAME: ", process.env.PINECONE_INDEX_NAME);


// not recommended at all - server should be stateless
// let posts = [
//     {
//         id: nanoid(),
//         title: "express()",
//         text: "By Sir Inzamam Malik"
//     }
// ]

// POST    /api/v1/post
// router.post('/post', async (req, res, next) => {
//     console.log('This is create post request', new Date());

//     if (
//         (req.body.title.trim().length == 0) || (req.body.text.trim().length == 0)
//     ) {
//         res.status(403);
//         res.send(`required parameters missing, 
//         example request body:
//         {
//             title: "abc post title",
//             text: "some post text"
//         } `);
//         return;
//     }

//     // posts.push({
//     //     id: nanoid(),
//     //     title: req.body.title,
//     //     text: req.body.text,
//     // })

//     try{
//                 await client.connect();
//                 console.log("Connected to Atlas");
//                 let personDocument = {

//                     id: nanoid(),
//                     title: req.body.title,
//                     text: req.body.text,

//                 };

//                 const p = await col.insertOne(personDocument);

//                 res.status(200).send('Post created successfully');
//                 console.log("Post created: ", p);

//                 await client.close();
//                 console.log("Disconnected Atlas");


//         }


//         catch(err){

//             console.log('Error in posting');
//             res.send('Error Not Found: ' + err.message);
            
//              }
// })

////////////////////////////////////////////////////////////////

// POST    /api/v1/post
// PineCone Database API POST
router.post('/post', async (req, res, next) => {
    console.log('this is signup!', new Date());

    if (
        !req.body.title
        || !req.body.text
    ) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            title: "abc post title",
            text: "some post text"
        } `);
        return;
    }

    try {
        // const insertResponse = await col.insertOne({
        //     // _id: "7864972364724b4h2b4jhgh42",
        //     title: req.body.title,
        //     text: req.body.text,
        //     createdOn: new Date()
        // });
        // console.log("insertResponse: ", insertResponse);

        const response = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: `${req.body.title} ${req.body.text}`,
        });
        const vector = response?.data[0]?.embedding
        console.log("vector: ", vector);




        const upsertResponse = await pcIndex.upsert([{
            id: nanoid(), // unique id
            values: vector,
            metadata: {
                title: req.body.title,
                text: req.body.text,
                createdOn: new Date().getTime()
            },
        }]);
        console.log("upsertResponse: ", upsertResponse);


        res.send({ message: 'post created' });
    } catch (e) {
        console.log("error inserting pinecone: ", e);
        res.status(500).send({ message: 'server error, please try later' });
    }
})






////////////////////////////////////////////////////////////////


// GET     /api/v1/posts
// router.get('/posts', async(req, res, next) => {
//     console.log('This is all posts request!', new Date());
//     // res.send(posts);
//     try {
//             await client.connect();
//             console.log("Connected to Atlas");
//             const cursor = col.find({}).sort({ _id: -1 });
//             let results = await cursor.toArray()
//             console.log("results: ", results);
//             res.send(results);
//             await client.close();
//             console.log("Disconnected Atlas");
//     }
//     catch(error){


//         console.log(error);
//         console.log('Error in getting posts');
//         res.status(404).send("Error in getting post")
        
//          }
// })

////////////////////////////////////////////////////////////////

// GET     /api/v1/posts
// Pinecone API

router.get('/posts', async (req, res, next) => {

    // const cursor = col.find({})
    //     .sort({ _id: -1 })
    //     .limit(100);

    // try {
    //     let results = await cursor.toArray()
    //     console.log("results: ", results);
    //     res.send(results);
    // } catch (e) {
    //     console.log("error getting data mongodb: ", e);
    //     res.status(500).send('server error, please try later');
    // }

    try {
        const response = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: "",
        });
        const vector = response?.data[0]?.embedding
        console.log("vector: ", vector);
        // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

        const queryResponse = await pcIndex.query({
            vector: vector,
            // id: "vec1",
            topK: 10000,
            includeValues: false,
            includeMetadata: true
        });

        queryResponse.matches.map(eachMatch => {
            console.log(`score ${eachMatch.score.toFixed(1)} => ${JSON.stringify(eachMatch.metadata)}\n\n`);
        })
        console.log(`${queryResponse.matches.length} records found `);

        const formattedOutput = queryResponse.matches.map(eachMatch => ({
            text: eachMatch?.metadata?.text,
            title: eachMatch?.metadata?.title,
            _id: eachMatch?.id,
        }))

        res.send(formattedOutput);

    } catch (e) {
        console.log("error getting data pinecone: ", e);
        res.status(500).send('server error, please try later');
    }

})


////////////////////////////////////////////////////////////////

// GET     /api/v1/post/:postId
router.get('/post/:postId', async(req, res, next) => {
    console.log('this is specific post request!', new Date());

    if (!req.params.postId) {
        res.status(403).send(`post id must be a valid number, no alphabet is allowed in post id`)
    }

    try{
        await client.connect();
        const filter = { _id: new ObjectId(req.params.postId) };
        const myDoc = await col.findOne(filter);
        res.send(myDoc);
        console.log("Found: ", myDoc, " with id: ", req.params.postId);
        await client.close();


    }
    catch(err){

        console.log('Error in getting posts');
        res.status(404).send("Error in getting post")
        await client.close();

    }

    
})

// PUT     /api/v1/post/:userId/:postId
// router.put('/post/edit/:postId', async (req, res, next) => {
//     console.log('This is edit! request', new Date());
//     if (
//         (req.body.title.trim().length == 0) || (req.body.text.trim().length == 0) ) {
//         res.status(403);
//         res.send(`required parameters missing, 
//         example request body:
//         {
//             title: "abc post title",
//             text: "some post text"
//         } `);
//         return;
//     }
//     // posts.forEach(post => {

//     //     if(post.id === req.params.postId){
//     //         post.title = req.body.title;
//     //         post.text = req.body.text;
            
//     //         return
//     //     }

//     // });

//  try{
//             await client.connect();
//             console.log("Connected Atlas");
//             const filter = { _id: new ObjectId(req.params.postId) };
//             const updateDoc = {

//                 $set: {
        
//                 title: req.body.title,
//                 text: req.body.text
        
//                 },
        
//             };
//             const result = await col.updateOne(filter, updateDoc);

//             res.send('Post Edited successfully');
//             await client.close();
//             console.log("Disconnected Atlas");
//     }
//     catch (err){

//         console.log(err);
//         res.send('Error Not Found: ' + err);


//     }
// })



////////////////////////////////////////////////////////////////
// PUT     /api/v1/post/:userId/:postId
// Pinecone API



router.put('/post/edit/:postId', async (req, res, next) => {

    // if (!ObjectId.isValid(req.params.postId)) {
    //     res.status(403).send(`Invalid post id`);
    //     return;
    // }

    if (!req.body.text
        && !req.body.title) {
        res.status(403).send(`required parameter missing, atleast one key is required.
        example put body: 
        PUT     /api/v1/post/:postId
        {
            title: "updated title",
            text: "updated text"
        }
        `)
    }

    // let dataToBeUpdated = {};
    // if (req.body.title) { dataToBeUpdated.title = req.body.title }
    // if (req.body.text) { dataToBeUpdated.text = req.body.text }
    // try {
    //     const updateResponse = await col.updateOne(
    //         {
    //             _id: new ObjectId(req.params.postId)
    //         },
    //         {
    //             $set: dataToBeUpdated
    //         });
    //     console.log("updateResponse: ", updateResponse);

    //     res.send('post updated');
    // } catch (e) {
    //     console.log("error inserting mongodb: ", e);
    //     res.status(500).send('server error, please try later');
    // }

    try {
        const response = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: `${req.body.title} ${req.body.text}`,
        });
        const vector = response?.data[0]?.embedding
        console.log("vector: ", vector);

        const upsertResponse = await pcIndex.upsert([{
            id: req.params.postId,
            values: vector,
            metadata: {
                title: req.body.title,
                text: req.body.text,
            },
        }]);
        console.log("upsertResponse: ", upsertResponse);


        res.send({ message: 'post created' });
    } catch (e) {
        console.log("error inserting mongodb: ", e);
        res.status(500).send({ message: 'server error, please try later' });
    }




})


////////////////////////////////////////////////////////////////

// DELETE  /api/v1/post/:userId/:postId
// router.delete('/post/delete/:postId', async (req, res, next) => {
//     console.log('This is delete! request', new Date());

//     // posts.forEach((post, index) => {

//     //     if (post.id === req.params.postId) {

//     //         posts.splice(index, 1);

//     //         return

//     //     }

//     // })

//     try{

//         await client.connect();
//         console.log("Connected Atlas");

//         const query = { _id: new ObjectId(req.params.postId)};

//         const result = await col.deleteOne(query);

//         if (result.deletedCount === 1) {

//             console.log("Successfully deleted one document.");
      
//           } else {
      
//             console.log("No documents matched the query. Deleted 0 documents.");
      
//             }


//         await client.close();
//         console.log("Disconnected Atlas");

//     res.send('Post deleted successfully');


//     }


//     catch (err) {

//         res.send('Error Not Found: ' + err.message);
//     }
    
    
// })


////////////////////////////////////////////////////////////////
// DELETE /api/v1/post/:userId/:postId
// PineCone API

router.delete('/post/delete/:postId', async (req, res, next) => {

    // if (!ObjectId.isValid(req.params.postId)) {
    //     res.status(403).send(`Invalid post id`);
    //     return;
    // }

    // try {
    //     const deleteResponse = await col.deleteOne({ _id: new ObjectId(req.params.postId) });
    //     console.log("deleteResponse: ", deleteResponse);
    //     res.send('post deleted');
    // } catch (e) {
    //     console.log("error deleting mongodb: ", e);
    //     res.status(500).send('server error, please try later');
    // }


    const deleteResponse = await pcIndex.deleteOne(req.params.postId)
    console.log("deleteResponse: ", deleteResponse);

    res.send('post deleted');
})

////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////
// Search API
// SEARCH /Search 

router.get('/search', async (req, res, next) => {

    try {
        const response = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: req.query.q,
        });
        const vector = response?.data[0]?.embedding
        console.log("vector: ", vector);
        // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

        const queryResponse = await pcIndex.query({
            vector: vector,
            // id: "vec1",
            topK: 20,
            includeValues: false,
            includeMetadata: true
        });

        queryResponse.matches.map(eachMatch => {
            console.log(`score ${eachMatch.score.toFixed(3)} => ${JSON.stringify(eachMatch.metadata)}\n\n`);
        })
        console.log(`${queryResponse.matches.length} records found `);

        const formattedOutput = queryResponse.matches.map(eachMatch => ({
            text: eachMatch?.metadata?.text,
            title: eachMatch?.metadata?.title,
            _id: eachMatch?.id,
        }))

        res.send(formattedOutput);

    } catch (e) {
        console.log("error getting data pinecone: ", e);
        res.status(500).send('server error, please try later');
    }

})









////////////////////////////////////////////////////////////////


router.post('/authenticate', async (req, res, next) => {

    res.status(200).send({success: true});

});

export default router