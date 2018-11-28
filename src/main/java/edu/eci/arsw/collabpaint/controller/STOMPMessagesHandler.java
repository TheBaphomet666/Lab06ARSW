package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.HashMap;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;
    private HashMap<String, ArrayList<Point>> mapa = new HashMap<>();
    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {


        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        System.out.println("Numdibujo:"+numdibujo);
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
        synchronized (mapa) {
            if (!mapa.containsKey(numdibujo)) {
                mapa.put(numdibujo, new ArrayList<>());

            }
            mapa.get(numdibujo).add(pt);
            if (mapa.get(numdibujo).size() > 3) {
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, mapa.get(numdibujo));
            }
        }
    }
}