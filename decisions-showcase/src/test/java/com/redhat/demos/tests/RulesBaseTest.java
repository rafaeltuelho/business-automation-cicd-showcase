package com.redhat.demos.tests;

import java.util.Collection;
import java.util.List;

import org.kie.api.KieBase;
import org.kie.api.KieServices;
import org.kie.api.builder.Message;
import org.kie.api.builder.Results;
import org.kie.api.runtime.ClassObjectFilter;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieRuntimeFactory;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.StatelessKieSession;
import org.kie.dmn.api.core.DMNModel;
import org.kie.dmn.api.core.DMNRuntime;

public class RulesBaseTest {
    protected KieSession createDefaultSession() {
        return this.createContainer().newKieSession();
    }
    
    protected KieBase createKnowledgeBase(String name) {
        KieContainer kContainer = this.createContainer();
        KieBase kbase = kContainer.getKieBase(name);
        
        if (kbase == null){
            throw new IllegalArgumentException("Unknown Kie Base with name '"+name+"'");
        }
        
        return kbase;
    }

    protected KieSession createSession(String name) {
        
        KieContainer kContainer = this.createContainer();
        KieSession ksession = kContainer.newKieSession(name);
        
        if (ksession == null){
            throw new IllegalArgumentException("Unknown Session with name '"+name+"'");
        }
        
        return ksession;
    }

    protected StatelessKieSession createStatelessSession(String name) {
        
        KieContainer kContainer = this.createContainer();
        StatelessKieSession ksession = kContainer.newStatelessKieSession(name);
        
        if (ksession == null){
            throw new IllegalArgumentException("Unknown Session with name '"+name+"'");
        }
        
        return ksession;
    }

    protected <T> Collection<T> getFactsFromKieSession(KieSession ksession, Class<T> classType) {
        return (Collection<T>) ksession.getObjects(new ClassObjectFilter(classType));
    }

    private KieContainer createContainer(){
        KieServices ks = KieServices.Factory.get();
        KieContainer kContainer = ks.getKieClasspathContainer();
        
        Results results = kContainer.verify();
        
        if (results.hasMessages(Message.Level.WARNING, Message.Level.ERROR)){
            List<Message> messages = results.getMessages(Message.Level.WARNING, Message.Level.ERROR);
            for (Message message : messages) {
                System.out.printf("[%s] - %s[%s,%s]: %s", message.getLevel(), message.getPath(), message.getLine(), message.getColumn(), message.getText());
            }
            
            throw new IllegalStateException("Compilation errors were found. Check the logs.");
        }
        
        return kContainer;
    }

}