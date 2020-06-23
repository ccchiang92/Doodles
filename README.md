ABC's Smart Doodler
[Try the demo](https://ccchiang92.github.io/Doodles/)
======
Project Objective
------
Inspired by Googles doodling game [Quick, Draw!](https://quickdraw.withgoogle.com/#) our group wanted to explore the world of convolutional neural networks(CNN) and how they work. To do this our goal was to see if we could produce a quick loading CNN on a web interface with no back end support. Users would choose a category and submit their own images to the CNN for decifering, with minimal load times and provide the user with visual feedback.  We want to provide the user with a data representation of the models predictions.  Also if possible provide a visual representation on "how" the model came to that particular conclusion.
  
Data Set
------
Google generiously has the entire data set available for public use. This consists of **Millions** of user submitted doodles.  The files are stored on their cloud service as 28x28 numpy arrays by category.  Google keeps track of the actual strokes of users so you can actual recreate how the user drew the image stroke by stroke.  There is also some metadata information about where the person is from etc.  For the scope of our project we will be focusing on just the image itself(28x28 numpy array).
  
------

#### CNN Model - Python

###### Extract
- Pull data from Google Cloud using .
```tf.keras.utils.get_file()```
- Loop through the downloaded files, Used ```np.load() ```to extract load the data into one array narrays / enumarate another array for label classification / and a list of the actual labe name extracted from the file name.


###### Transform
- One hot encoding for our label array.`
```y = tf.keras.utils.to_categorical(y, num_classes=len(label_names))```
- Sequential Models take in 4D arrays so we reshape.
--* Quantize the data to values between 0 and 1.
```X = X.reshape(-1,28,28, 1).astype('float32') / 255```
- Use sklearn's train_test_split to seperate our data into train and test splits.


###### Load
- Is our data correct, do we have an image still?



###### Model Building
- Setup a Sequential Convolution Neural Network to run our data into.
--* Our model is a much smaller version of the famous VGG-16 model based on the research paper [Very Deep Convolutional Networks for Large-Scale Image Recognition](https://arxiv.org/abs/1409.1556) by *Karen Simonyan, Andrew Zisserman*

###### Results
Reached a peak of 89% accuracy with some hypertuning.
- The plugin HPARAM was used for Hypertuning.
- Used a GridSearch method on a smaller subset of data for testing.

After Hypertuning the model some of the big take aways are:
1. The relu activation function alone had almost a +30% increase in accuracy compared to some others.
2. Adam was the goto loss function with default .001, might of been able to increase it a touch.
3. More layers = better. This affects load times on the model, so this needs to be balanced to your objective.

We used TensorBoard to watch and review the models performance.

FS for TensorBoard was used to view results.


#### HTML / Javascript
1. **Layout** 
- Use Bootstrap for general HTML layout and formatting.
- HTML canvas will be the element that the user can interact and "draw" on.
- Used a js library called fabric to handle the event listener actions.

2. **Image ETL**
###### Extract
- Pulled out the users drawing with ```tf.browser.fromPixels(img,1)```. The one indicates only 1 color channel.
###### Transform
- Resized the image to match Googles data that the model was trained on.

```tf.image.resizeBilinear(imgTF,[28,28])```

- Quantize the user image.

```tf.scalar(1.0).sub(img28.div(tf.scalar(255.0))```


###### Load
- Start loading the saved model right away with an async, await function.

```async function loadModel() {```
    ```model = await tf.loadLayersModel('./model/30Ver2/model.json');```
- Load in our list of categories the model has been trained on.

 ```await jQuery.getJSON```
 
 
- Last but not least, run the users image into the model with the "Assess Drawing" button.


### IT WORKS!!! ###
*(most of the time)*


Results
------
#### Visualization
- We used d3 bar graph to visualize real-time predictions and show how confidence level changes while user is giving more details to the drawing.
- We also used clusterize.js custom library to handle with long lists of drawing categories and visualize them in a small scrolling window.

The Future
------
This concept can be expanded in many ways.
- We only used a small subset of Googles images.  The model could be set up with batch loading, dataGenerators or even turn the data into Tensorflow data objects.
- By combining multiple models/types we can add to the complexity of the model significantly. To increase "learning" we could add a RNN, add a binary classification problem, add in sentiment analysis if we add in text, etc.
- Not limit the user imput to a drawing, let them submit a picture, test, or even video.
- Video is only a dimension of time different from an image.
- The quickdraw data's raw data are stored as vectors of people's drawing strokes, potentially we can use the stroke data to generate a machine learning model to create new doodles from a given category. Using this model we would then create a versus game between the player drawing and computer guesses V.S. the computer drawing and the player guesses.

Lastly, responsiveness of the website is poor, right now it's only design for screens of 1080p or higher on a computer. Hopefully we can improve moble support in the future.




  
  
