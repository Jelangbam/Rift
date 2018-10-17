import React, { Component } from 'react'

import { Subscription } from '../streamLib/stream'
import { UserContext } from '../App'
import EditTableContent from './EditTableContent'
import PlayerTableContent from './PlayerTableContent'

import './PlayerList.css'

class RegisteredPlayers extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: [],
      sortState: 0
    }
    this.userMap = new Map()
    this.addInfo = this.addInfo.bind(this)
    this.sortByName = this.sortByName.bind(this)
    this.sortByIGN = this.sortByIGN.bind(this)
  }

  componentDidMount() {
    this.subscription = new Subscription('/users',
    (info) => {
      this.setState({
        data: info
      })
    })
  }

  componentWillUnmount() {
    this.subscription && this.subscription.end()
  }

  addInfo(user, info) {
    this.userMap.set(user, info)
  }

  sortByName() {
    if(this.state.sortState === 2) {
      this.reverseUsers()
      return
    }
    let comparator = nameComparator.bind(this)
    function nameComparator(a,b) {
      return this.userMap.get(a).name.toLowerCase().localeCompare(this.userMap.get(b).name.toLowerCase())
    }
    this.sortUsers(comparator, 2)
  }

  sortByIGN() {
    if(this.state.sortState === 3) {
      this.reverseUsers()
      return
    }
    let comparator = ignComparator.bind(this)
    function ignComparator(a,b) {
      return this.userMap.get(a).ign.toLowerCase().localeCompare(this.userMap.get(b).ign.toLowerCase())
    }
    this.sortUsers(comparator, 3)
  }

  reverseUsers() {
    let temp = this.state.data.slice()
    this.setState(prevState => ({
      data: temp.reverse(),
      reversed: !prevState.reversed
    }))
  }

  sortUsers(comparator, state){
    let temp = this.state.data.slice()
    temp.sort(comparator)
    this.setState({
      data: temp,
      sortState: state
    })
  }

  componentDidUpdate() {
    if(this.state.data.length > 0
      && this.state.sortState === 0) {
      let index = this.state.data.indexOf(this.props.me)
      if(index > 0) {
        let temp = this.state.data.slice()
        let x = temp.splice(index, 1)
        temp = x.concat(temp)
        this.setState({
          data: temp,
          sortState: 1
        })
      }
      else if(index === 0){
        this.setState({
          sortState: 1
        })
      }
    }
  }

  render() {
    return (
      <div className='playerListDisplay'>
        <table className='tableContainer'>
          <thead>
            <tr>
              <th></th>
              <th onClick={this.sortByName}>Player Name</th>
              <th onClick={this.sortByIGN}>Summoner Name</th>
              <th>Roles</th>
              <th>Notes</th>
              <th>Captain</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map((user) => {
              return (
                <UserContext.Consumer key={user}>
                  {(me) => {
                    return user === me._key
                    ? <EditTableContent key={user} user={user} me={me} addInfo={this.addInfo} />
                    : <PlayerTableContent key={user} user={user} me={me} addInfo={this.addInfo} />
                  }}
                </UserContext.Consumer>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

export default React.forwardRef((props, ref) => (
  <UserContext.Consumer>
  {(me) => <RegisteredPlayers {...props} me={me._key} ref={ref} />}
  </UserContext.Consumer>
))
