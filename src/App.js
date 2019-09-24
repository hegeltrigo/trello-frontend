import './App.css';
import React from 'react'
import Board from 'react-trello'
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
 

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
  }
};


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

      title: '',
      description: '',
      end_date: new Date(),
      archived: true,
      list_id: '',
      id: '',

      board: {
          lanes: [],
          modalIsOpen: false,
          
        },
    };
   }

  openModal = () => {
    this.setState({modalIsOpen: true});
  }
 
  afterOpenModal = () => {
 
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

  onCardClick = async(cardId, metadata, laneId) => {

    try{
      const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
      }
      let res = await axios.post(`http://localhost:8080/trello/api.php?task=get_card&id=${cardId}`);
      console.log(res.data)
      var date = new Date(res.data.end_date); 

      this.setState({
        title: res.data.title,
        description: res.data.description,
        end_date: date,
        archived: res.data.archived,
        id: res.data.id,
        list_id: res.data.list_id
      })

      this.openModal()


    }catch(e){
      console.log(e)
    }
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
        myCard.label = card.end_date
        myCard.draggable = true
        mycards.push(myCard)
      });  


      myList.cards = mycards


      lanes.push(myList)
    });
    let my_data = {lanes: lanes }
    this.setState({ board: my_data });  
  };

  handleChange = (event) => {
    console.log(event.target.name)
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit = async(event) => {
    event.preventDefault();
    try{
      const formData = new FormData();
      let date = this.state.end_date
      date = date.getUTCFullYear() + '-' +
      ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
      ('00' + date.getUTCDate()).slice(-2) + ' ' + 
      ('00' + date.getUTCHours()).slice(-2) + ':' + 
      ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
      ('00' + date.getUTCSeconds()).slice(-2);

      let archived = this.state.archived ? 1 : 0

      formData.append('title', this.state.title)
      formData.append('description',this.state.description)
      formData.append('end_date', date)
      formData.append('list_id',this.state.list_id)
      formData.append('archived', archived)
      formData.append('id',this.state.id)

      console.log(this.state.end_date.getUTCFullYear())

      const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
      }
      let res = await axios.post("http://localhost:8080/trello/api.php?task=update_card", formData, config);
      this.closeModal()
      
      let res2 = await axios.get("http://localhost:8080/trello/api.php?task=get_all");
      this.getLists(res2.data)

      // this.getLists()
      console.log(res.data)

    }catch(e){
      console.log(e)
    }   
  }

  toggleChange = () => {
    this.setState({
      archived: !this.state.archived,
    });
  }

  handleChangeDate = date => {
    this.setState({
      end_date: date
    });
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
            // editLaneTitle
            canAddLanes
            onLaneAdd={this.onLaneAdd}

    >
      
    </Board>
      <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
        >

        <form onSubmit={this.handleSubmit}>
          <label>
            <input name="title" placeholder="Titulo" type="text" value={this.state.title} onChange={this.handleChange} />
          </label>
          <br></br>
          <label>
            <input name="description" placeholder="Descripción" type="text" value={this.state.description} onChange={this.handleChange} />
          </label>
          <br></br>

          <DatePicker placeholder="Fecha"
            // value={this.state.startDate}
            selected={this.state.end_date}
            onChange={this.handleChangeDate}
          />
          <br></br>
          <label>
              <input type="checkbox"
                checked={this.state.archived}
                onChange={this.toggleChange}
              />
              Archivar
          </label>

          <br></br>
          <br></br>

          <input type="submit" value="Guardar" />
        </form>
 
 
        </Modal>
    </div>
   
    
    )  
  }
}

export default App;
