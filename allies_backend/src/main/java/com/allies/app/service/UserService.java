package com.allies.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.allies.app.model.User;
import com.allies.app.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(Integer id, User updatedUser) {
        Optional<User> existing = userRepository.findById(id);
        if (existing.isPresent()) {
            User user = existing.get();
            user.setTen(updatedUser.getTen());
            user.setDiaChi(updatedUser.getDiaChi());
            user.setSdt(updatedUser.getSdt());
            user.setMail(updatedUser.getMail());
            return userRepository.save(user);
        }
        throw new IllegalArgumentException("User not found");
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }
}