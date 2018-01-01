<template>
  <v-app>
    <v-navigation-drawer temporary v-model="sideNav" absolute>
      <v-list>
        <v-list-tile v-for="item in menuItems" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon left>{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            {{item.title}}
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="userIsAuthenticated" @click="onLogout">
          <v-list-tile-action>
            <v-icon left>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            Logout
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app dark class="primary">
      <v-toolbar-side-icon @click.stop="sideNav = !sideNav"
                           class="hidden-sm-and-up"></v-toolbar-side-icon>
      <v-toolbar-title>
        <router-link to="/" tag="span" style="cursor:pointer">
          DevMeetup
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="item in menuItems" :key="item.title" :to="item.link">
          <v-icon left>{{item.icon}}</v-icon>
          {{item.title}}
        </v-btn>
        <v-btn flat v-if="userIsAuthenticated" @click="onLogout">
          <v-icon left>exit_to_app</v-icon>
          Logout
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <router-view></router-view>

      </v-container>
    </v-content>

    <v-footer app></v-footer>
  </v-app>

</template>

<script>
  import VContent from 'vuetify/src/components/VGrid/VContent'

  export default {
    components: {VContent},
    data () {
      return {
        sideNav: false
      }
    },
    methods: {
      onLogout () {
        this.$store.dispatch('logout')
      }
    },
    computed: {
      userIsAuthenticated () {
        const user = this.$store.getters.user
        return user !== null && user !== undefined
      },
      menuItems () {
        let menuItems = [
          {
            icon: 'face',
            title: 'Sign up',
            link: '/signup'
          },
          {
            icon: 'lock_open',
            title: 'Sign in',
            link: '/signin'
          }
        ]
        if (this.userIsAuthenticated) {
          menuItems = [
            {
              icon: 'list',
              title: 'View Meetups',
              link: '/meetups'
            },
            {
              icon: 'room',
              title: 'Organize Meetup',
              link: '/meetups/new'
            },
            {
              icon: 'person',
              title: 'Profile',
              link: '/profile'
            }
          ]
        }
        return menuItems
      }
    }
  }
</script>
