import { View, Text, FlatList, TouchableOpacity, ImageBackground, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import React, { useState } from "react";
import { icons, videos } from "../constants";
import { Video, ResizeMode } from "expo-av";

const zoomIn = {
  0: {
    scale: 0.9,
    opacity: 0.5,
  },
  1: {
    scale: 1.1,
    opacity: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
    opacity: 1,
  },
  1: {
    scale: 0.9,
    opacity: 0.5,
  },
};

const TrendingItem = ({ activeItem, item }) => {
  const [play, setPlay] = useState(false);
  return (
    <Animatable.View className="mr-5" animation={activeItem === item.$id ? zoomIn : zoomOut} duration={500}>
      {play ? (
        <Video
          source={videos.dummy}
          className="w-52 h-72 rounded-[35px] mt-3 bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity className="relative justify-center items-center" activeOpacity={0.7} onPress={() => setPlay(true)}>
          <ImageBackground source={{ uri: item.thumbnail }} className="w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black/40" resizeMode="cover" />
          <Image source={icons.play} className="w-12 h-12 absolute" resizeMode="contain" />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[0]);

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <FlatList
      onViewableItemsChanged={viewableItemsChanged}
      data={posts}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => <TrendingItem activeItem={activeItem} item={item} />}
      horizontal
      viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
      contentOffset={{ x: 170 }}
    />
  );
};

export default Trending;
