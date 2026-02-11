package com.yasboss.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yasboss.model.Category;
import com.yasboss.repository.CategoryRepository;

@Service
public class CategoryService {
    @Autowired private CategoryRepository categoryRepository;

    public List<Category> getAll() { return categoryRepository.findAll(); }

    public Category save(Category category) { return categoryRepository.save(category); }

    public void delete(Long id) { categoryRepository.deleteById(id); }
}