class PostsController < ApplicationController

  def index
    render json: Post.all.joins(:user)
      .select('posts.title,posts.content, users.email, posts.category')
  end

end
