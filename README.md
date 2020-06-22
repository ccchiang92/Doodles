Project Name -HERE-
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
- Loop through the downloaded files, Use ```np.load() ```to extract load the data into one array narrays / enumarate another array for label classification / and a list of the actual labe name extracted from the file name.


###### Transform
- One hot encoding for our label array.
```y = tf.keras.utils.to_categorical(y, num_classes=len(label_names))```
- Sequential Models take in 4D arrays so we reshape.
--* change the data type to save some memory and quantize the data to values between 0 and 1.
```X = X.reshape(-1,28,28, 1).astype('float32') / 255```
- Use sklearn's train_test_split to seperate our data into train and test splits.


###### Load
- Is our data correct, do we have an image still?



###### Model Building
- Setup a Sequential Convolution Neural Network to run our data into.
--* Our model is a much smaller version of the famous VGG-16 model based on the research paper [Very Deep Convolutional Networks for Large-Scale Image Recognition](https://arxiv.org/abs/1409.1556) by *Karen Simonyan, Andrew Zisserman*


#### HTML / Javascript
- Use Bootstrap for general HTML layout and formatting.
- HTML canvas will be the element that the user can interact and "draw" on.
- Used a js library called fabric to handle the "drawing" actions.

#### Visualization






  
  
