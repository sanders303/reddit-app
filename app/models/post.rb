class Post < ApplicationRecord
  belongs_to :user
  has_many :votes

  def self.define_filters(search)
    return if search.nil?

    queries = {
      "email" => {query: "LOWER(users.email) like LOWER(?)", value: nil},
      "title" => {query: "LOWER(posts.title) LIKE LOWER(?)", value: nil},
      "category" => {query: "LOWER(posts.category) LIKE LOWER(?)", value: nil},
      "user_id" => {query: "posts.user_id = ?", value: nil},
    }

    queries.delete_if {|filter, sql| search[filter].blank? }

    queries.each do |filter, sql|
      filter_value = search[filter]
      if filter == "email"
        queries[filter][:value] = "%#{filter_value}%"
      elsif filter == "title"
        search_title_like = "%#{filter_value}%"
        queries[filter][:value] = search_title_like
      elsif filter == "category"
        search_category_like = "%#{filter_value}%"
        queries[filter][:value] = search_category_like
      elsif filter == "user_id"
        queries[filter][:value] = filter_value
      elsif filter == "date_min"
        date = DateTime.strptime(filter_value + formatted_offset, "%m/%d/%Y %z")
        queries[filter][:value] = date.beginning_of_day.utc
      elsif filter == "date_max"
        date = DateTime.strptime(filter_value + formatted_offset, "%m/%d/%Y %z")
        queries[filter][:value] = date.end_of_day.utc
      end
    end

    query_string = []
    query_values = []

    queries.each do |filter, sql|
      query_string << queries[filter][:query]
      query_values << queries[filter][:value]
    end

    query_string = query_string.join(" AND ")

    return [query_string, query_values]
  end
end
