require 'rubygems'
require 'sinatra'

set :sessions, true

BLACKJACK_AMOUNT = 21
DEALER_MIN_HIT = 17
INITIAL_BET_AMOUNT = 500


helpers do
  def calculate_total(cards)
    arr = cards.map { |e| e[1] }

    total = 0
    arr.each do |value|
      if value == "A"
        total += 11
      elsif value.to_i == 0
        total += 10
      else
        total += value.to_i
      end
    end

    arr.select { |e| e== "A" }.count.times do
      break if total <= BLACKJACK_AMOUNT
      total -=10
    end

    total
  end

  def card_image(card)
    suit = case card[0]
             when 'H' then
               'hearts'
             when 'D' then
               'diamonds'
             when 'C' then
               'clubs'
             when 'S' then
               'spades'
           end

    value = card[1]
    if ['J', 'Q', 'K', 'A'].include?(value)
      value = case card[1]
                when 'J' then
                  'jack'
                when 'Q' then
                  'queen'
                when 'K' then
                  'king'
                when 'A' then
                  'ace'
              end
    end

    "<img src='/images/cards/#{suit}_#{value}.png' class='card_image' width='120' height='120'>"
  end

  def winner!(msg)
    session[:money] = session[:money] + session[:bet]
    @play_again = true
    @show_hit_or_stay_buttons = false
    @winner = "<strong>#{session[:name].capitalize} wins!</strong> #{msg} You've increased your Bitcoins by #{session[:bet]}!"
  end

  def loser!(msg)
    if session[:money] = session[:money] - session[:bet]
      @play_again = true
      @show_hit_or_stay_buttons = false
      @loser = "<strong>#{session[:name].capitalize} loses this hand!  You've lost #{session[:bet]}.</strong> #{msg}"
    end
  end

  def tie!(msg)
    session[:money] = session[:money]
    @play_again = true
    @show_hit_or_stay_buttons = false
    @winner = "<strong>It's a tie.</strong> #{msg}"
  end
end


before do
  @show_hit_or_stay_buttons = true
end

get '/' do
  if session[:name]
    redirect '/bet'
  else
    redirect '/startform'
  end
end

get '/startform' do
  erb :startform
end

post '/startform' do
  if params[:name].empty?
    @error = "Name is required"
    halt erb(:startform)
  end

  session[:name] = params[:name]
  session[:money] = INITIAL_BET_AMOUNT
  redirect '/bet'
end

get '/bet' do
  if session[:money] <= 0
    redirect '/bank'
  end
  erb :bet
end


post '/bet' do
  if params[:bet].empty? || params[:bet].to_i <= 0
    erb :bet
    @error = "You need to place a bet."
    erb :bet
  elsif params[:bet].to_i > session[:money]
    @error = "You placed a bet for #{params[:bet]}, but you've only got #{session[:money]} left."
    erb :bet
  else
    session[:bet] = params[:bet].to_i
    redirect '/game'

  end
end

get '/game' do
  session[:turn] = session[:name]

  suits = ['H', 'D', 'C', 'S']
  values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  session[:deck] = suits.product(values).shuffle!

  session[:dealer_cards] = []
  session[:player_cards] = []
  session[:dealer_cards] << session[:deck].pop
  session[:player_cards] << session[:deck].pop
  session[:dealer_cards] << session[:deck].pop
  session[:player_cards] << session[:deck].pop

  erb :game
end

post '/game/player/hit' do
  session[:player_cards] << session[:deck].pop

  player_total = calculate_total(session[:player_cards])
  if player_total == BLACKJACK_AMOUNT
    winner!("#{session[:player_name]} hit blackjack.")
  elsif player_total > BLACKJACK_AMOUNT
    loser!("It looks like #{session[:player_name]} busted at #{player_total}.")
  end

  erb :game, layout: false 
end

post '/game/player/stay' do
  @success="#{session[:name]} has chosen to stay!"
  @show_hit_or_stay_buttons = false
  redirect '/game/dealer'
end

get '/game/dealer' do
  session[:turn] = "dealer"
  @show_hit_or_stay_buttons = false

  dealer_total = calculate_total(session[:dealer_cards])

  if dealer_total == BLACKJACK_AMOUNT
    loser!("Dealer hit blackjack. Try again!")
  elsif dealer_total > BLACKJACK_AMOUNT
    winner!("Dealer busted with #{dealer_total}.")
  elsif dealer_total >= DEALER_MIN_HIT
    redirect '/game/compare'
  else
    @show_dealer_hit_button = true
  end

  erb :game, layout: false
end

post '/game/dealer/hit' do
  session[:dealer_cards] << session[:deck].pop
  redirect '/game/dealer'
end

get '/game/compare' do
  @show_hit_or_stay_buttons = false

  player_total = calculate_total(session[:player_cards])
  dealer_total = calculate_total(session[:dealer_cards])

  if player_total < dealer_total
    loser!("#{session[:name]} stayed at #{player_total}, and the dealer stayed at #{dealer_total}.")
  elsif player_total > dealer_total
    winner!("#{session[:name]} stayed at #{player_total} and the dealer stayed at #{dealer_total}.")
  else
    tie!("Both #{session[:name]} and the dealer stayed at #{player_total}.")
  end

  erb :game, layout: false 
end

get '/bank' do
  erb :bank
end

post '/bank' do
  session[:money] = INITIAL_BET_AMOUNT 
  erb :bet
end

get '/game_over' do
  session[:name] = nil
  session[:money] = nil
  erb :game_over
end

post '/game_over' do
  session[:name] = nil
  session[:money] = nil
  erb :game_over
end
