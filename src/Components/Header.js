import React, { useState, useEffect } from 'react'
import logo from '../Logo.drawio.png';
import './Header.css'
import SearchIcon from '@material-ui/icons/Search';
import { Avatar } from '@material-ui/core';
import { Button } from '@material-ui/core';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import { storage } from '../Firebase'
import firebase from '@firebase/app-compat';
import { auth, provider } from '../Firebase';
import { db } from '../Firebase'
import { TextField } from '@material-ui/core';

function Header() {
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [user, setUser] = useState(null)
    const [caption, setCaption] = useState('')
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const uploadImage = () => {
        if (image) {
            const ImageRef = storage.ref(`images/${image.name}`).put(image)
            ImageRef.on("state_changed", (snapshot) => {
                // Progress....
                const progress_bar = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                setProgress(progress_bar)
            },
                (error) => {
                    alert(error.message)
                },
                () => {
                    storage.ref("images").child(image.name).getDownloadURL().then(url => {
                        db.collection('Posts').add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            postUrl: url,
                            username: user?.displayName,
                            profileUrl: user?.photoURL,
                            imagename: image.name,
                            caption: caption
                        })
                    })
                    setCaption('')
                }
            )
            setOpen(false);
        }
        else{
            console.error("No Image is Uploaded");
        }

    }

    // Creating the User 
    const createUser = () => {
        auth.signInWithPopup(provider).then((result) => {
            console.log(result)
        }).catch((err) => {
            alert(err.message)
        })
    }

    // Setting the user
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
    console.log(progress)
    return (
        <div className="header">
            <img src={logo} alt="logo" className="header__logo"></img>
            <div className="header__search">
                <input type="search" placeholder="Search" />
                <SearchIcon />
            </div>
            <div className="header__icons">
                {user ?
                    <>
                        <Avatar variant="rounded" alt={user?.displayName} src={user?.photoURL} className="header__icons__icon" />
                        <AddCircleOutlinedIcon className="add__icon" onClick={() => { handleClickOpen() }} />
                        <Button onClick={() => { auth.signOut() }}>Logout</Button>
                    </>
                    : <Button onClick={() => { createUser() }}>Sign In With Google</Button>}
            </div>

            {/* Dialouge box */}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Post</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select the photo from your device you want to post
                    </DialogContentText>
                    <br />
                    <input
                        id="actual-btn"
                        type="file"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                setImage(e.target.files[0])
                            }
                        }}
                    />
                    <br />
                    <br />
                    <TextField type="text" placeholder="Caption" value={caption} onChange={(e) => { setCaption(e.target.value) }} />


                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { uploadImage() }}>Upload</Button>
                    <Button onClick={() => { handleClose() }}>Cancel</Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}

export default Header
