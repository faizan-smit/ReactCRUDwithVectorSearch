
import express from 'express';
import {client} from './../mongodb.mjs'
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import {
    stringToHash,
    varifyHash
} from "bcrypt-inzi";
let router = express.Router();
const dbName = "AUTH-DB";
const db = client.db(dbName);
const col = db.collection("users");

let userExists;

// router.post('/login', (req, res, next) => {
//     console.log('this is login!', new Date());
//     res.send('this is login v1' + new Date());
// })

router.post('/signup', async (req, res, next) => {
    console.log('this is signup!', new Date());


    if (
        (req.body.email.trim().length == 0) || (req.body.password.trim().length == 0)
    ) {
        res.status(403);
        res.send(`required parameters missing`);
        return;
    }

    try{

    await client.connect();
    req.body.email = req.body.email.toLowerCase();

    const filter = { email: req.body.email };
    const myDoc = await col.findOne(filter);


    if(!myDoc){



                    try{
                        req.body.email = req.body.email.toLowerCase();
                        const passwordHash = await stringToHash(req.body.password);
                        await client.connect();
                        console.log("Connected to Atlas");
                        let personDocument = {

                            email: req.body.email,
                            password: passwordHash,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            createdOn: new Date()

                        };

                        const p = await col.insertOne(personDocument);

                        res.send('user created');
                        console.log("Created User");

                        await client.close();
                        console.log("Disconnected Atlas");


                }


                catch(err){

                    console.log('Error in posting');
                    res.send('Error: ' + err);
                    await client.close();

                    
                          }


            }else{

               userExists = true;
                console.log('error error', err);


            }

            await client.close();




        }catch (err){


            await client.close();
            
            if(userExists){
                console.log('Error email already exists');
                res.send('Error email already exists');
            }else{
                console.log('error: ' + err);
                res.send('Error:' + err);
            }


        }


    
})



router.post('/login', async (req, res, next) => {

    if (
        !req.body?.email
        || !req.body?.password
    ) {
        res.status(403);
        res.send(`required parameters missing, 
        example request body:
        {
            email: "some@email.com",
            password: "some$password",
        } `);
        return;
    }
    req.body.email = req.body.email.toLowerCase();

    try {
        await client.connect();
            const filter = { email: req.body.email };
            const myDoc = await col.findOne(filter);
        console.log("result: ", myDoc);

        if (!myDoc) { // user not found
            res.status(403).send({
                message: "email or password incorrect"
            });
            return;
        } else { // user found


            // console.log(myDoc);
            const isMatch = await varifyHash(req.body.password, myDoc.password)

            if (isMatch) {
                
                const token = jwt.sign({
                    isAdmin: false,
                    firstName: myDoc.firstName,
                    lastName: myDoc.lastName,
                    email: req.body.email,
                }, process.env.SECRET, {
                    expiresIn: '24h'
                });

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    // expires: new Date(dateAfter2MinInMili)
                });

                res.status(200).send({
                    message: "login successful"
                });
                return;
            } else {
                res.status(401).send({
                    message: "email or password incorrect"
                })
                return;
            }
        }

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }
    finally{

        await client.close();
        console.log("closed atlas");
    }
})



export default router