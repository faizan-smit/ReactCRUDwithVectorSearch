import axios from "axios";
import { useEffect, useState, useRef } from "react";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [toggleRefresh, setToggleRefresh] = useState(false);
  const searchInputRef = useRef(null);


  const searchHandler = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/v1/search?q=${searchInputRef.current.value}`);
      console.log(response.data);

      setIsLoading(false);
      setPosts([...response.data]);
    } catch (error) {
      console.log(error.data);
      setIsLoading(false);
    }
  };


  useEffect(() => {
    let fetchPosts = async ()=> {
      try {
        const response = await axios.get(`/api/v1/posts`);
        console.log(response.data);
        setPosts(response.data);
        // setPosts(posts.reverse());
        console.log(posts);
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
          console.log(error.response.status);
        }
      }
    }

    fetchPosts();
  }, [toggleRefresh]);

  const deletePostHandler = async (_id) => {
    try {
      setIsLoading(true);
      const response = await axios.delete(`/api/v1/post/delete/${_id}`);

      setIsLoading(false);
      console.log(response.data);
      setAlert(response.data.message);
      setToggleRefresh(!toggleRefresh);
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  const editSaveSubmitHandler = async (e) => {
    e.preventDefault();
    const _id = e.target.elements[0].value;
    const title = e.target.elements[1].value;
    const text = e.target.elements[2].value;

    try {
      setIsLoading(true);
      const response = await axios.put(`/api/v1/post/edit/${_id}`, {
        title: title,
        text: text,
      });

      setIsLoading(false);
      console.log(response.data);
      setAlert(response?.data?.message);
      setToggleRefresh(!toggleRefresh);
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  return (

    <>
    <form onSubmit={searchHandler} className="search--form">
      <input type="search" placeholder="Search..." ref={searchInputRef} className="search" />
      <button type="submit" hidden></button>
    </form>

    <div>
      {posts.map((data, index) => (
        <div key={data._id} className="postCard">

{data.isEdit ? (
              <form onSubmit={editSaveSubmitHandler} className="editForm">
                <input type="text" disabled value={data._id} hidden />
                <input defaultValue={data.title} type="text" placeholder="title" className="postTitle" />
                <br />
                <textarea defaultValue={data.text} type="text" placeholder="body" className="postText" />
                <br />
                <button type="submit" className="edit-btn">Save</button>
                <button
                  type="button"
                  onClick={() => {
                    data.isEdit = false;
                    setPosts([...posts]);
                  }}
                  className="delete-btn"
                >
                  Cancel
                </button>
              </form>
            ) 
          : (<><div className="postTitle">{data.title}</div>
          <div className="postText">{data.text}</div>  
          <div>
          <button
                  onClick={(e) => {
                    console.log("click");
                    posts[index].isEdit = true;
                    setPosts([...posts]);
                  }}
                  className="edit-btn"
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    deletePostHandler(data._id);
                  }}
                  className="delete-btn"
                >
                  Delete
                </button>
          </div>

          </>)}
        </div>
      ))}
    </div>
    </>
  );
};

export {AllPosts};
