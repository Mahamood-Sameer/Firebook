import './App.css';
import Header from './Components/Header';
import Posts from './Components/Posts';
import { useState, useEffect } from 'react'
import { db,auth } from './Firebase'



function App() {
  const [posts, setPosts] = useState(null)
  const [user,setUser]=useState(null)

  useEffect(() => {
    db.collection("Posts").orderBy('timestamp','desc').onSnapshot((snapshot) => {
      setPosts(snapshot.docs.map((doc) => {
        return (
          {
            id: doc.id,
            timestamp: doc.data().timestamp,
            postUrl: doc.data().postUrl,
            username: doc.data().username,
            profileUrl: doc.data().profileUrl,
            caption:doc.data().caption,
            imagename:doc.data().imagename
          }
        )

      }))

    })
  }, [])

  useEffect(() => {
    auth.onAuthStateChanged(user => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user)
            }
            else {
                setUser(null)
            }
        })
    })
}, [user])

  return (
    <div className="app">
      <Header />
      <div className="posts__container">
        {
          posts?.map(post => (

            <Posts info={post} user={user}/>
          ))
        }
      </div>
    </div>
  );
}

export default App;
