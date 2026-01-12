package com.yasboss.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yasboss.model.Address;
import com.yasboss.repository.AddressRepository;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public List<Address> getAddressesByEmail(String email) {
        return addressRepository.findByUserEmail(email);
    }

    @Transactional
    public Address addAddress(String email, Address address) {
        address.setUserEmail(email);
        
        // If this is the user's first address, make it the default automatically
        List<Address> existing = addressRepository.findByUserEmail(email);
        if (existing.isEmpty()) {
            address.setDefault(true);
        } else if (address.isDefault()) {
            // If user checked "set as default", unset others
            existing.forEach(a -> a.setDefault(false));
            addressRepository.saveAll(existing);
        }
        
        return addressRepository.save(address);
    }

    @Transactional
    public void setDefault(String email, Long addressId) {
        List<Address> existing = addressRepository.findByUserEmail(email);
        existing.forEach(a -> {
            a.setDefault(a.getId().equals(addressId));
        });
        addressRepository.saveAll(existing);
    }

    public void deleteAddress(Long id) {
        addressRepository.deleteById(id);
    }
}