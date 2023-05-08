from flask import Flask,jsonify,request
from flask_restx import Resource,Api,reqparse
import pickle
import test_final

app = Flask(__name__)
#api = Api(app)
app.config['DEBUG'] = True

#model = pickle.load(open('recommend.pkl','rb'))

@app.route('/')
def hello():
    return 'Hello,World!'


@app.route('/predict')

def predict():
    #node서버에서 request 받아서 data에 저장
    #data = request.유저
    #weather = request.유저날씨
    target = 0
    weather = 1
    
    pred = train_model(target,weather)
    print(pred)
    return 

#if __name__ == "__main__":
 #   app.run()
