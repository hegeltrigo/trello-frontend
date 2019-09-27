import './App.css';
import React from 'react'
import Board from 'react-trello'
import Modal from 'react-modal';
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    position: 'absolute'
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
      selectedOption: null,
      id: '',
      value: '',
      changedValue : '',
      lista: [],
      options: [],
      board: {
          lanes: [],
          modalIsOpen: false,
          
        },
    };
   }

  handleChangeSelect = selectedOption => {
    this.setState({ selectedOption });
    console.log(`Option selected:`, selectedOption);
    this.onCardClick(selectedOption.value)
  };

  handleInputChange =  (input) => {
    axios.get(`http://localhost:8080/trello/api.php?task=search&search=${input}`)
    .then(response => {
        // console.log(response.data)
        let data = response.data
        let options = []
        data.forEach(function (item, index) {
          let option = {value: item.id, label: item.title}
          options.push(option)
        });
        this.setState({lista: response.data, options: options})
    })
    .catch(e => {
        // Podemos mostrar los errores en la consola
        console.log(e);
    })
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
      console.log(res.data, ' que pachoooooo')

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
      console.log('estafuncando', cardId)
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

      let res2 = await axios.get("http://localhost:8080/trello/api.php?task=get_all");
      this.getLists(res2.data)

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

      let res2 = await axios.get("http://localhost:8080/trello/api.php?task=get_all");
      this.getLists(res2.data)

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

  getCountry =() => {
    return [
  {name: 'Afghanistan', code: 'AF'},{name: 'Åland Islands', code: 'AX'},{name: 'Albania', code: 'AL'},{name: 'Algeria', code: 'DZ'},{name: 'American Samoa', code: 'AS'},{name: 'AndorrA', code: 'AD'},{name: 'Angola', code: 'AO'}, {name: 'Anguilla', code: 'AI'},{name: 'Antarctica', code: 'AQ'},{name: 'Antigua and Barbuda', code: 'AG'},{name: 'Argentina', code: 'AR'}, {name: 'Armenia', code: 'AM'},{name: 'Aruba', code: 'AW'}, {name: 'Australia', code: 'AU'},{name: 'Austria', code: 'AT'},{name: 'Azerbaijan', code: 'AZ'},{name: 'Bahamas', code: 'BS'}, {name: 'Bahrain', code: 'BH'},{name: 'Bangladesh', code: 'BD'}, {name: 'Barbados', code: 'BB'},{name: 'Belarus', code: 'BY'}, {name: 'Belgium', code: 'BE'}, {name: 'Belize', code: 'BZ'}, {name: 'Benin', code: 'BJ'}, {name: 'Bermuda', code: 'BM'},{name: 'Bhutan', code: 'BT'},{name: 'Bolivia', code: 'BO'},{name: 'Bosnia and Herzegovina', code: 'BA'},   {name: 'Botswana', code: 'BW'},   {name: 'Bouvet Island', code: 'BV'},   {name: 'Brazil', code: 'BR'},   {name: 'British Indian Ocean Territory', code: 'IO'},   {name: 'Brunei Darussalam', code: 'BN'},   {name: 'Bulgaria', code: 'BG'},   {name: 'Burkina Faso', code: 'BF'},   {name: 'Burundi', code: 'BI'},   {name: 'Cambodia', code: 'KH'},   {name: 'Cameroon', code: 'CM'},   {name: 'Canada', code: 'CA'},   {name: 'Cape Verde', code: 'CV'},{name: 'Cayman Islands', code: 'KY'},   {name: 'Central African Republic', code: 'CF'},   {name: 'Chad', code: 'TD'}]
  }
   
  matchCountry = (state, value) => {
      console.log(state);
      console.log(value);
    return (
      state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
      state.code.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }


  componentDidMount = async () => {
    Modal.setAppElement('body');

    let res = await axios.get("http://localhost:8080/trello/api.php?task=get_all");
    this.getLists(res.data)
  }
  

  render() {
    const { selectedOption } = this.state;

    return(
    <div id="main">

        <div>
            <Select
            // other props
            components={
              {
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
                // Menu: () => null,
              }
            }            
            value={selectedOption}
            onChange={this.handleChangeSelect}
            options={this.state.options}
            // isSearchable={true}
            placeholder={'Search ...'}
            onInputChange={this.handleInputChange}


          />

        </div>
       
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
          // style={customStyles}
          style={{ zIndex: 1 }}


        >
        <div className="row">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-12">
                <div className="float-right">

                <button onClick={this.closeModal}>X</button>
                <br></br>                <br></br>

                </div>  
              </div>
            </div>  
            <div className="row">
              <div className="col-md-8">
                    <form onSubmit={this.handleSubmit}>
                      <div className="form-group">
                         <input name="title" className= "form-control" placeholder="Title" type="text" value={this.state.title} onChange={this.handleChange} />

                      </div>

                      <div className="form-group">
                      <input name="description" className= "form-control" placeholder="Description" type="text" value={this.state.description} onChange={this.handleChange} />

                      </div>
                    
                      <div className="form-group">
                          <DatePicker placeholder="Fecha"
                          // value={this.state.startDate}
                          selected={this.state.end_date}
                          onChange={this.handleChangeDate}
                          className= "form-control"
                          style={{ zIndex: 1 }}

                        />
                      </div>
                    
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

                    <input type="submit" value="Guardar" className="btn btn-info float-right" />
                  </form>
              </div>
            </div>
           

            
          </div>

        </div>
        
 
 
        </Modal>
    </div>
   
    
    )  
  }
}

export default App;
