class PostsController < ApplicationController

  def index
    @posts = Posts.all
  end

end
