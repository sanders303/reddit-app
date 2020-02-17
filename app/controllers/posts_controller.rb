class PostsController < ApplicationController

  def index
    query_string, query_values = Post.define_filters(params)
    user_id = current_user ? current_user.id : nil
    render json: Post.all.joins(:user)
      .where(query_string, *query_values)
      .select('posts.id, posts.title, posts.content, users.email, posts.category, posts.user_id')
      .map{|post| {id: post.id, content: post.content, title: post.title, email: post.email, category: post.category, user_id: post.user_id, current_user: user_id == post.user_id }}
  end

end
