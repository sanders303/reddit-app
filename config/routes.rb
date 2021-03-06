Rails.application.routes.draw do
  devise_for :users
  root 'home#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :posts do
    member do
      post 'vote'
    end
  end
  resources :comments
  resources :users do
    resources :posts, module: :users
  end
end
