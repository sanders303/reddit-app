class CommentsController < ApplicationController

  def index
    render json: Comment.where(post_id: params[:post_id], comment_id: nil)
  end

  def create
    Comment.create!(post_id: params[:post_id], user_id: current_user.id, content: params[:comment])
    render json: Comment.where(post_id: params[:post_id], comment_id: nil).order('created_at ASC')
  end

end
