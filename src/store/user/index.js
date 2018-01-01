import * as firebase from 'firebase'

export default {
  state: {
    user: null
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    registerUserForMeetup (state, payload) {
      const id = payload.id
      if (state.user.registerMeetups.findIndex((meetup) => { return id === meetup.id }) >= 0) {
        return
      }
      state.user.registerMeetups.push(id)
      state.user.fbKeys[id] = payload.fbKey
    },
    unregisterUserForMeetup (state, payload) {
      const id = payload.id
      const registerMeetups = state.user.registerMeetups
      registerMeetups.splice(registerMeetups.findIndex((meetup) => { return id === meetup.id }), 1)
      Reflect.deleteProperty(state.user.fbKeys, payload)
    }
  },
  actions: {
    registerUserForMeetup ({commit, getters}, payload) {
      commit('setLoading', true)
      const user = getters.user
      firebase.database().ref('users/' + user.id).child('/registrations').push(payload)
        .then((data) => {
          commit('setLoading', false)
          commit('registerUserForMeetup', {id: payload, fbKey: data.key})
        })
        .catch((error) => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    unregisterUserForMeetup ({commit, getters}, payload) {
      commit('setLoading', true)
      const user = getters.user
      if (!user.fbKeys) {
        return
      }
      const fbKey = user.fbKeys[payload]
      firebase.database().ref('users/' + user.id).child('/registrations').child(fbKey).remove()
        .then(() => {
          commit('setLoading', false)
          commit('unregisterUserForMeetup', payload)
        })
        .catch((error) => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    signUserUp ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false)
            const newUser = {
              id: user.uid,
              registerMeetups: [],
              fbKeys: []
            }
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
          }
        )
    },
    signUserIn ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false)
            const newUser = {
              id: user.uid,
              registerMeetups: [],
              fbKeys: []
            }
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
          }
        )
    },
    autoSignIn ({commit}, payload) {
      commit('setUser', {
        id: payload.uid,
        registerMeetups: [],
        fbKeys: []
      })
    },
    fetchUserData ({commit, getters}) {
      commit('setLoading', true)
      firebase.database().ref('users/' + getters.user.id + '/registrations').once('value')
        .then(data => {
          const dataPairs = data.val()
          let registerMeetups = []
          let fbKeys = {}
          for (let key in dataPairs) {
            const meetupId = dataPairs[key]
            fbKeys[meetupId] = key
            registerMeetups.push(meetupId)
          }
          const updatedUser = {
            id: getters.user.id,
            registerMeetups,
            fbKeys
          }
          commit('setLoading', false)
          commit('setUser', updatedUser)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    logout ({commit}) {
      firebase.auth().signOut()
      commit('setUser', null)
    }
  },
  getters: {
    user (state) {
      return state.user
    }
  }
}
