#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHTPIN 21
#define DHTTYPE DHT22
#define TRIG_PIN 12
#define ECHO_PIN 14
#define RELAY_PIN 25
#define MOISTURE_PIN 34

DHT dht(DHTPIN, DHTTYPE);
WiFiServer server(80);
const char* ssid = "justtest";
const char* password = "wuplumber99";
const char* serverName = "http://192.168.1.39:5000/data";
unsigned long lastTime = 0;
unsigned long timerDelay = 5000;

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
  
  server.begin();
 }

void handleGetRequest() {
  WiFiClient client = server.available();
  if (client) {
    Serial.println("New client connected");

    String request = client.readStringUntil('\r');
    Serial.println(request);

    String url = request.substring(request.indexOf(' ') + 1);
    url = url.substring(0, url.indexOf(' '));
    Serial.println(url);
    if (url == "/motor") {
        int motor = digitalRead(RELAY_PIN);
        String response = "HTTP/1.1 200 OK\r\n";
        response += "Access-Control-Allow-Origin: *\r\n";
        response += "Content-Type: application/json\r\n\r\n";
        response += "{\"motor\":" + String(motor) + "}"; 
        client.print(response);
    } else if (url == "/motor/on") {     
        digitalWrite(RELAY_PIN, HIGH);
        String response = "HTTP/1.1 200 OK\r\n";
        response += "Access-Control-Allow-Origin: *\r\n";
        response += "Content-Type: application/json\r\n\r\n";
        response += "{\"message\": \"Motor turned on\"}";    
        client.print(response);
        while(1){
          bool isSendSuccess = postJsonToWebService();
          if(isSendSuccess) break;
        }
        while(1){
          bool isSaved = postDataToDB();
          if(isSaved) break;
        } 
    } else if (url == "/motor/off") {   
        digitalWrite(RELAY_PIN, LOW);
        String response = "HTTP/1.1 200 OK\r\n";
        response += "Access-Control-Allow-Origin: *\r\n";
        response += "Content-Type: application/json\r\n\r\n";
        response += "{\"message\": \"Motor turned off\"}";
        client.print(response); 
        while(1){
          bool isSendSuccess = postJsonToWebService();
          if(isSendSuccess) break;
        }
        while(1){
          bool isSaved = postDataToDB();
          if(isSaved) break;
        } 
      } else {
        String response = "HTTP/1.1 404 Not Found\r\n";
        response += "Access-Control-Allow-Origin: *\r\n";
        response += "Content-Type: application/json\r\n\r\n";
        response += "{\"message\": \"Invalid route\"}";     
        client.print(response);
    }
    delay(1);
    client.stop();
    Serial.println("Client disconnected");
  }
}

bool postDataToDB() {
  if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      const char* routePath = "http://192.168.1.39:5000/database";
      http.begin(client, routePath);

      StaticJsonDocument<32> doc;
      doc["message"] = "save current data to db";
      String payload;
      serializeJson(doc, payload);
      
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(payload);
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      
      if (httpResponseCode == 200) {
        Serial.println("HTTP Request successful");
        http.end();
        return true;
      } else {
        Serial.print("HTTP Error: ");
        Serial.println(httpResponseCode);
        http.end();
        return false;
      }     
  } else {
      WiFi.begin(ssid, password);
      while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
      }
   }
}

bool postJsonToWebService() {
    float distance = readWaterLevel();
    Serial.print("distance : ");
    Serial.println(distance);
    delayMicroseconds(100);
    
    float humidity = dht.readHumidity();
    Serial.print("humidity : ");
    Serial.println(humidity);
    delayMicroseconds(100);
    
    float temperature = dht.readTemperature();
    Serial.print("temperature : ");
    Serial.println(temperature);
    delayMicroseconds(100);
    
    int moisture = analogRead(MOISTURE_PIN);
    Serial.print("moisture : ");
    Serial.println(moisture);
    delayMicroseconds(100);
    
    int motor = digitalRead(RELAY_PIN);
    Serial.print("motor : ");
    Serial.println(motor);
    delayMicroseconds(100);
    
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      http.begin(client, serverName);
      
      StaticJsonDocument<128> doc;
      doc["water"] = distance;
      doc["humidity"] = humidity;
      doc["temperature"] = temperature;
      doc["moisture"] = moisture;
      doc["motor"] = motor;
      String payload;
      serializeJson(doc, payload);
  
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(payload);
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
  
      if (httpResponseCode == 200) {
        Serial.println("HTTP Request successful");
        http.end();
        return true;
      } else {
        Serial.print("HTTP Error: ");
        Serial.println(httpResponseCode);
        http.end();
        return false;
      } 
    } else {
      WiFi.begin(ssid, password);
      while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
      }
    }
}

float readWaterLevel(void){
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  float value = pulseIn(ECHO_PIN, HIGH) / 58.0;
  return value;
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
    
    while(1){
      bool isSendSuccess = postJsonToWebService();
      if(isSendSuccess) break;
    }
    
    handleGetRequest();
    
    lastTime = millis();
  }
}
