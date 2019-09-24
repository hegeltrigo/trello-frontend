// import React from 'react';
// import logo from './logo.svg';
import './App.css';
import React from 'react'
import Board from 'react-trello'
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import axios from "axios";

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

// Modal.setAppElement('#main')

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      board: {
          lanes: [],
          modalIsOpen: false,
          currentCard: {}
        },
    };
   }

   openModal = () => {
    this.setState({modalIsOpen: true});
  }
 
  afterOpenModal = () => {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00';
  }
 
  closeModal = () => {
    this.setState({modalIsOpen: false});
  }

  onCardDelete = async (cardId, laneId) => {
    try{
      
      let res = await axios.delete(`http://localhost:8080/trello/api.php?task=delete_card&id=${cardId}`);
      console.log(res.data)

    }catch(e){
      console.log(e)
    }
  }

  onLaneDelete = async (laneId) => {
    try{
      
      let res = await axios.delete(`http://localhost:8080/trello/api.php?task=delete&id=${laneId}`);
      console.log(res.data)

    }catch(e){
      console.log(e)
    }
  }

  handleDragStart = async (cardId, laneId) => {
    
  }

  handleDragEnd = async (cardId, sourceLaneId, targetLaneId, position, cardDetails) => {
    try{
      const formData = new FormData();
      formData.append('list_id',targetLaneId)
      formData.append('id',cardId)

      const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
      }
      let res = await axios.post("http://localhost:8080/trello/api.php?task=move", formData, config);
      console.log(res.data)

    }catch(e){
      console.log(e)
    }
  }

  onCardClick = (cardId, metadata, laneId) => {

    this.openModal()
  }

  onCardAdd = async (card, laneId) => {
    try{
      const formData = new FormData();
      let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
      formData.append('title',card.title)
      formData.append('description',card.description)
      formData.append('end_date', date)
      formData.append('list_id',laneId)
      formData.append('archived',0)

      const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
      }
      let res = await axios.post("http://localhost:8080/trello/api.php?task=insert_card", formData, config);
      console.log(res.data)

    }catch(e){
      console.log(e)
    }
  }

  onLaneAdd = async (params) => {
    try{
      const formData = new FormData();
      formData.append('name',params.title)
      formData.append('description',params.title)
      
      const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
      }
      let res = await axios.post("http://localhost:8080/trello/api.php?task=insert", formData, config);
      console.log(res.data)

    }catch(e){
      console.log(e)
    }
  }

  getLists = async (data) => {
    let lanes = []
    data.forEach(function (list, index) {
      let myList = {}
      myList.id = `${list.id}`
      myList.title = list.name
      myList.label =  list.name


      let cards = list.cards

      let mycards = []
      cards.forEach(function (card, index) {
        let myCard = {}

        myCard.id = `${card.id}`
        myCard.title = card.title
        myCard.description = card.description
        // myCard.label = "lala"
        myCard.draggable = true
        mycards.push(myCard)
      });  


      myList.cards = mycards


      lanes.push(myList)
    });
    let my_data = {lanes: lanes }
    this.setState({ board: my_data });  
  };

  componentDidMount = async () => {
    let res = await axios.get("http://localhost:8080/trello/api.php?task=get_all");
    this.getLists(res.data)
  }

  render() {

    return(
    <div id="main">
       <Board data={this.state.board} 
            onCardClick={this.onCardClick}
            handleDragEnd={this.handleDragEnd}
            onCardAdd={this.onCardAdd}
            onCardDelete={this.onCardDelete}
            onLaneDelete={this.onLaneDelete}

            editable
            canAddLanes
            onLaneAdd={this.onLaneAdd}

    >
      
    </Board>
      <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
 
         <h1>Show Card en progreso ...</h1>
        </Modal>
    </div>
   
    
    )  
  }
}

export default App;
