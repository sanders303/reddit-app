/* eslint no-console: 0 */
// Run this example by adding <%= javascript_pack_tag 'hello_vue' %> (and
// <%= stylesheet_pack_tag 'hello_vue' %> if you have styles in your component)
// to the head of your layout file,
// like app/views/layouts/application.html.erb.
// All it does is render <div>Hello Vue</div> at the bottom of the page.

// import Vue from 'vue'
// import App from '../app.vue'
//
// document.addEventListener('DOMContentLoaded', () => {
//   const app = new Vue({
//     render: h => h(App)
//   }).$mount()
//   document.body.appendChild(app.$el)
//
//   console.log(app)
// })


// The above code uses Vue without the compiler, which means you cannot
// use Vue to target elements in your existing html templates. You would
// need to always use single file components.
// To be able to target elements in your existing html/erb templates,
// comment out the above code and uncomment the below
// Add <%= javascript_pack_tag 'hello_vue' %> to your layout
// Then add this markup to your html template:
//
// <div id='hello'>
//   {{message}}
//   <app></app>
// </div>


// import Vue from 'vue/dist/vue.esm'
// import App from '../app.vue'
//
// document.addEventListener('DOMContentLoaded', () => {
//   const app = new Vue({
//     el: '#hello',
//     data: {
//       message: "Can you say hello?"
//     components: { App }
//   })
// })
//
//
//
// If the project is using turbolinks, install 'vue-turbolinks':
//
// yarn add vue-turbolinks
//
// Then uncomment the code block below:
//
import TurbolinksAdapter from 'vue-turbolinks'
import Vue from 'vue/dist/vue.esm'
import App from '../app.vue'
import Rails from 'rails-ujs';

Vue.use(TurbolinksAdapter)

document.addEventListener('turbolinks:load', () => {
  const postListElement = document.getElementById('post-list');
  if (postListElement !== null) {
    const postList = new Vue({
      el: postListElement,
      data: () => {
        return {
          posts: [],
          category: '',
          title: '',
        }
      },
      mounted() {
        fetch(postListElement.dataset.url)
          .then(response => response.text())
          .then((text) => {
            this.posts = JSON.parse(text);
          })
      },
      methods: {
        updatePost(index) {
          const post = this.posts[index];
          const data = {
            post: {
              user_id: post.user_id,
              content: post.content,
              title: post.title,
              category: post.category,
            }
          };
          const url = `/users/${post.user_id}/posts/${post.id}`;
          this.writeToApi(url, 'PATCH', data, (response) => {
            console.log(response);
          });
        },
        vote(index, vote) {
          const data = {
            vote_type: vote,
          };
          const url = `/posts/${this.posts[index].id}/vote`;
          this.writeToApi(url, 'POST', data, (response) => {
            response.json().then((json) => {
              this.handleVote(json.new, json.change, this.posts[index], vote)
            });
          });
        },
        handleVote(newVote, changedVote, obj, vote) {
          if (newVote) {
            if (vote === 0) {
              obj.upvotes += 1
            } else {
              obj.downvotes += 1
            }
          } else if (changedVote) {
            if (vote === 0) {
              obj.upvotes += 1
              obj.downvotes -= 1
            } else {
              obj.downvotes += 1
              obj.upvotes -= 1
            }
          }
        },
        search() {
          fetch(`${postListElement.dataset.url}?category=${this.category}&title=${this.title}`)
            .then(response => response.text())
            .then((text) => {
              console.log(text);
              this.posts = JSON.parse(text);
            })
        },
        commentOnPost(index) {
          const post = this.posts[index];
          const data = {
            comment: post.comment,
            post_id: post.id
          };
          this.writeToApi('comments', 'POST', data, (response) => {
            response.json().then((json) => {
              post.comments = json;
              post.show_comments = true;
              post.comment = '';
            });
          });

        },
        viewComments(index) {
          const showing = this.posts[index].show_comments;
          if (showing) {
            this.posts[index].show_comments = false
          } else {
            fetch(`comments?post_id=${this.posts[index].id}`, {
              method: 'GET',
              headers: {
                'content-type': 'application/json',
                'X-CSRF-Token': Rails.csrfToken(),
              },
            })
              .then((response) => {
                response.json().then((json) => {
                  this.posts[index].comments = json
                  this.posts[index].show_comments = true
                });
              });
          }
        },
        writeToApi(url, method, data, successFunction) {
          fetch(url, {
            method,
            body: JSON.stringify(data),
            headers: {
              'content-type': 'application/json',
              'X-CSRF-Token': Rails.csrfToken(),
            },
            credentials: 'same-origin',
          })
            .then(successFunction);
        }
      }
    })
  }


})
