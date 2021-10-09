import React, { useState, useEffect } from 'react'
import "./Posts.css"
import { Avatar } from '@material-ui/core'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import { db, storage } from '../Firebase'
import DeleteIcon from '@mui/icons-material/Delete';
import { ref, deleteObject } from "firebase/storage";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';



function Posts({ info, user }) {

    const [comments, setComments] = useState(null)
    const [comment_text, setCommentText] = useState('')
    const [open, setOpen] = useState(false);

    const Add__comment = (e) => {
        e.preventDefault();
        if ((comment_text) && (user)) {
            db.collection("Posts").doc(info?.id).collection("Comments").add({
                username: user?.displayName,
                profileUrl: user?.photoURL,
                comment: comment_text
            })
            setCommentText('')
        }

    }


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const delete_post = () => {
        setOpen(false);
        db.collection("Posts").doc(info?.id).delete()
        const desertRef = ref(storage, `images/${info?.imagename}`);
        // Delete the file
        deleteObject(desertRef).then(() => {
        }).catch((error) => {
            alert(error.message)
        });
    }

    useEffect(() => {
        db.collection("Posts").doc(info.id).collection("Comments").onSnapshot(snapShot => (
            setComments(snapShot.docs.map(doc => (doc.data())))
        ))
    }, [info, comments])


    return (

        <div className="posts">
            <div className="posts__header">
                <div className="posts__header__visible">
                    <Avatar variant="rounded" alt="Sameer" src={info?.profileUrl} className="posts__header__visible__logo"/>
                    <div className="post__info">
                        <strong>{info?.username}</strong>
                        <p>{new Date(info?.timestamp?.toDate()).toUTCString()}</p>
                    </div>
                </div>
                {
                    user?.displayName === info?.username && <DeleteIcon className="post__delete" onClick={() => {
                        handleClickOpen()
                    }} />
                }

            </div>
            <img src={info?.postUrl} alt="post" className="posts__image" />
            <div className="posts__footer">
                <form onSubmit={(e) => { Add__comment(e) }}>
                    <input type="text" placeholder="Add a comment" value={comment_text} onChange={(e) => { setCommentText(e.target.value) }} />
                    <button type="submit" onClick={(e) => { Add__comment(e) }}><SendIcon /></button>
                </form>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>{info?.caption}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography><strong>Comments</strong></Typography>
                        <br />
                        {
                            comments?.length ?
                                comments.map(comment => (
                                    <Typography className="post__comment">
                                        <Avatar variant="rounded" className="post__comment__image" src={comment?.profileUrl} />
                                        <p><strong>{comment?.username}</strong> {comment?.comment} </p>
                                    </Typography>
                                ))
                                :
                                <center>No Comments yet..... :(</center>
                        }
                    </AccordionDetails>
                </Accordion>
            </div>

            {/* Dialouge box */}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Delete Post</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to delete the post ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { delete_post() }}>Delete</Button>
                    <Button onClick={() => { handleClose() }}>Cancel</Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}

export default Posts
