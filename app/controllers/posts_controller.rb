class PostsController < ApplicationController

  def index
    query_string, query_values = Post.define_filters(params)
    user_id = current_user ? current_user.id : nil
    render json: Post.all.joins(:user)
      .where(query_string, *query_values)
      .select('posts.id, posts.title, posts.content, users.email, posts.category, posts.user_id')
      .map{|post| {
        id: post.id, content: post.content, title: post.title, email: post.email,
        category: post.category, user_id: post.user_id,
        current_user: user_id == post.user_id,
        upvotes: Vote.where(post_id: post.id, vote_type: 0).count,
        downvotes: Vote.where(post_id: post.id, vote_type: 1).count
      }}
  end

  def vote
    vote = Vote.where(user_id: current_user.id, post_id: params[:id]).first
    if vote.nil?
      vote = Vote.create(user_id: current_user.id, vote_type: params[:vote_type], post_id: params[:id])
      new = true
    elsif vote.vote_type != params[:vote_type]
      vote.vote_type = params[:vote_type]
      vote.save
      change = true
    end
    render json: {change: change, new: new}
  end

end
