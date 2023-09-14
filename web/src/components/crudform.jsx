import axios from 'axios';
import { useState, useRef, useEffect } from "react";
import { fetchPosts } from './postrender';


let PostForm = () => {

    
    const postTitleRef = useRef(null)
    const postTextRef = useRef(null)

    console.log(postTitleRef)
    


    let createPost = async (e) => {

        e.preventDefault();

        let postTitle = postTitleRef.current.value
        let postText = postTextRef.current.value

        console.log(postTitle)

        

    // baseUrl/api/v1/post
        try{
        let response = await axios.post(`/api/v1/post`, {

            title: postTitle,
            text: postText
            })

            console.log(response.data);

            window.location.reload();
            // getAllPost();

            }       
                            
        catch(error) {
            // handle error
            console.log(error.data);
        }

    };

    


    return (


        <div>

                <div id="the-form">
                    <form onSubmit={createPost}>

                        <h2>Create a post:</h2>
                        <div>
                        <span>
                        <label htmlFor="postTitle">Title:</label>
                        <input type="text" name="postTitle" id="postTitle" placeholder="Heading" ref={postTitleRef} />
                        </span>
                        <br />
                        <br />
                        <span className="form--textarea">
                        <label htmlFor="postText">Text:</label>

                        <textarea type="text" name="postText" id="postText" placeholder="Some text here" cols="30" rows="10" ref={postTextRef} ></textarea>
                        </span>
                        </div>
                        <br />

                        <button type="submit">Submit Post</button>

                        <br />
                        <br />
                        <br />
                    </form>

                </div>

        </div>


    )

}

export default PostForm